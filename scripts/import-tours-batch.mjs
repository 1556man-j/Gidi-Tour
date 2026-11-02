/**
 * Gidi Tour CSV -> Sanity bulk importer
 *
 * Run from the WEBSITE project root:
 *   npm install
 *   npm install @sanity/client
 *   node scripts/import-tours-batch.mjs
 *
 * Required environment variables (keep token private):
 *   SANITY_PROJECT_ID=hxcb2tkw
 *   SANITY_DATASET=production
 *   SANITY_WRITE_TOKEN=your_real_token
 *
 * Images are searched on Wikimedia Commons and uploaded as Sanity assets.
 * Review the generated image report; automated image matching is not guaranteed.
 */
import { createClient } from '@sanity/client';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const CSV_PATH = process.argv[2] || 'giditour tours batch 3.csv';
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'hxcb2tkw';
const DATASET = process.env.SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const API_VERSION = '2025-02-19';
const DRY_RUN = process.env.DRY_RUN === '1';
const GALLERY_COUNT = 3;

if (!TOKEN && !DRY_RUN) {
  console.error('Missing SANITY_WRITE_TOKEN. Set it in your terminal environment; do not put it in client-side code.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (ch !== '\r') field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const headers = (rows.shift() || []).map(h => h.trim().replace(/^\uFEFF/, ''));
  return rows.filter(r => r.some(v => v.trim())).map(r =>
    Object.fromEntries(headers.map((h, i) => [h, (r[i] || '').trim()]))
  );
}
const slugify = s => String(s || '').toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const splitList = s => String(s || '').split(/\s*\|\s*/).map(x => x.trim()).filter(Boolean);
const numberFromRange = value => {
  const nums = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return 0;
  const n = nums.map(Number);
  return Math.round((n.length > 1 ? (n[0] + n[1]) / 2 : n[0]) * 100) / 100;
};
const bool = s => /^(yes|true|1)$/i.test(String(s || '').trim());

function mapCategory(raw, title = '', summary = '') {
  const s = `${raw} ${title} ${summary}`.toLowerCase();
  if (/safari|wildlife|game drive|animal|national park/.test(s)) return 'Safari';
  if (/coast|beach|island|snorkel|diving|boat|creek/.test(s)) return 'Coastal';
  if (/art|music|nightlife|gallery|craft|fashion|afrobeat|dance/.test(s)) return 'Art';
  if (/hike|trek|climb|adventure|zipline|cycling|landscape|nature/.test(s)) return 'Adventure';
  if (/city|urban|architecture|market|food|culinary/.test(s)) return 'City Break';
  return 'Cultural';
}

async function commonsImages(query, count = 8) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(count),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1400',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': 'GidiTourBulkImporter/1.0 (tour image import)' }
  });
  if (!res.ok) throw new Error(`Wikimedia search HTTP ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  return pages.map(p => {
    const info = p.imageinfo?.[0];
    const meta = info?.extmetadata || {};
    return {
      title: p.title,
      url: info?.thumburl || info?.url,
      sourceUrl: info?.descriptionurl || '',
      license: meta.LicenseShortName?.value || 'License not identified',
      artist: (meta.Artist?.value || '').replace(/<[^>]*>/g, '').slice(0, 300),
    };
  }).filter(x => x.url && /\.(jpe?g|png|webp)$/i.test(new URL(x.url).pathname));
}

async function findImages(tour) {
  const query = [tour.Title, tour['Country name'], ...splitList(tour.Highlights).slice(0, 2)]
    .filter(Boolean).join(' ');
  let found = [];
  try {
    found = await commonsImages(query, 10);
    if (found.length >= GALLERY_COUNT + 1) return found.slice(0, GALLERY_COUNT + 1);
  } catch (e) {
    console.warn(`  Image search warning for "${tour.Title}": ${e.message}`);
  }
  // Destination-level fallback if the specific search returns too few results.
  try {
    const fallback = await commonsImages(`${tour['Country name']} tourism landscape`, 10);
    const combined = [...found, ...fallback];
    const seen = new Set();
    return combined.filter(x => x.url && !seen.has(x.url) && seen.add(x.url)).slice(0, GALLERY_COUNT + 1);
  } catch {
    return found.slice(0, GALLERY_COUNT + 1);
  }
}

async function uploadImage(image) {
  const response = await fetch(image.url, {
    headers: { 'User-Agent': 'GidiTourBulkImporter/1.0 (tour image import)' }
  });
  if (!response.ok) throw new Error(`Image download HTTP ${response.status}: ${image.url}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error(`Not an image response (${contentType})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 15 * 1024 * 1024) throw new Error('Image is larger than 15 MB');
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const asset = await client.assets.upload('image', buffer, {
    filename: `${slugify(image.title || 'tour-image').slice(0, 70)}.${ext}`,
    contentType,
    title: image.title || 'Tour image',
    source: {
      name: 'Wikimedia Commons',
      id: image.sourceUrl || image.url,
      url: image.sourceUrl || image.url,
    },
  });
  return {
    _type: 'image',
    _key: slugify(image.title || asset._id).slice(0, 60) || asset._id.slice(-8),
    asset: { _type: 'reference', _ref: asset._id },
  };
}

const csv = parseCSV(await readFile(CSV_PATH, 'utf8'));
console.log(`Read ${csv.length} rows from ${CSV_PATH}. Project ${PROJECT_ID}/${DATASET}.`);
if (DRY_RUN) console.log('DRY RUN enabled: no documents or assets will be uploaded.');

const report = { created: [], updated: [], skipped: [], failed: [], images: [] };

for (let i = 0; i < csv.length; i++) {
  const r = csv[i];
  const title = r.Title;
  const slug = slugify(r.Slug || title);
  if (!title || !slug || !r['Country name'] || !r['Country slug']) {
    report.failed.push({ title: title || `(row ${i + 2})`, error: 'Missing title, slug, country or country slug' });
    continue;
  }

  try {
    const existing = await client.fetch(
      '*[_type == "tour" && slug.current == $slug][0]{_id, title}',
      { slug }
    );
    if (existing) {
      report.skipped.push({ title, slug, reason: `Already exists as ${existing._id}` });
      console.log(`[${i + 1}/${csv.length}] SKIP existing: ${title}`);
      continue;
    }

    const base = {
      _type: 'tour',
      _id: `tour-${slug}`,
      title,
      slug: { _type: 'slug', current: slug },
      country: r['Country name'],
      countrySlug: slugify(r['Country slug']),
      category: mapCategory(r.Category, title, r.Summary),
      duration: r.Duration || '',
      groupSize: r['Group size'] || '',
      price: numberFromRange(r['Price per person (USD)']),
      rating: Math.round((3.5 + Math.random()) * 10) / 10, // testing-only sample rating
      reviewCount: 0,
      summary: r.Summary || '',
      highlights: splitList(r.Highlights),
      includes: [],
      popular: bool(r['Popular?']),
      // SEO is intentionally not mapped until the custom seo.ts field structure is confirmed.
    };

    const imageMatches = await findImages(r);
    let image = undefined, gallery = [];
    const imageNotes = [];
    if (imageMatches.length) {
      if (!DRY_RUN) {
        try {
          image = await uploadImage(imageMatches[0]);
          imageNotes.push({ role: 'cover', ...imageMatches[0] });
        } catch (e) { imageNotes.push({ role: 'cover', error: e.message }); }
        for (const match of imageMatches.slice(1, GALLERY_COUNT + 1)) {
          try {
            if (!DRY_RUN) {
              gallery.push(await uploadImage(match));
              imageNotes.push({ role: 'gallery', ...match });
            }
          } catch (e) { imageNotes.push({ role: 'gallery', error: e.message }); }
          await sleep(250);
        }
      }
    }
    if (image) base.image = image;
    if (gallery.length) base.gallery = gallery;

    if (!DRY_RUN) {
      await client.createIfNotExists(base);
      report.created.push({ title, slug, images: { cover: Boolean(image), gallery: gallery.length } });
    } else {
      report.created.push({ title, slug, dryRun: true, candidateImages: imageMatches.length });
    }
    report.images.push({ title, notes: imageNotes, candidates: imageMatches.map(x => ({
      title: x.title, url: x.sourceUrl || x.url, license: x.license, artist: x.artist
    })) });
    console.log(`[${i + 1}/${csv.length}] ${DRY_RUN ? 'DRY RUN' : 'IMPORTED'}: ${title} | cover ${image ? 'yes' : 'no'} | gallery ${gallery.length}`);
    await sleep(350);
  } catch (e) {
    report.failed.push({ title, slug, error: e.message });
    console.error(`[${i + 1}/${csv.length}] FAILED: ${title}: ${e.message}`);
  }
}

await mkdir('import-reports', { recursive: true });
const reportPath = path.join('import-reports', `tour-import-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log('\nImport finished.');
console.log(`Created/imported: ${report.created.length}`);
console.log(`Skipped existing: ${report.skipped.length}`);
console.log(`Failed: ${report.failed.length}`);
console.log(`Image report: ${reportPath}`);
console.log('Review image licences/attribution and verify that automated image matches fit each tour.');
