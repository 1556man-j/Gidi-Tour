export type Category = 'Guides' | 'Culture' | 'Food' | 'Tips' | 'Stories';

export type Article = {
	slug: string;
	title: string;
	excerpt: string;
	category: Category;
	destination: string;
	readTime: number;
	date: string;
	image: string;
	featured?: boolean;
	content: string[]; // paragraphs — real article body
};

export const categories: Category[] = ['Guides', 'Culture', 'Food', 'Tips', 'Stories'];

export const categoryColor: Record<Category, string> = {
	Guides: '#5C9B19',
	Culture: '#F98315',
	Food: '#F98315',
	Tips: '#5C9B19',
	Stories: '#17200f'
};

export const articles: Article[] = [
	{
		slug: 'lagos-like-a-local',
		title: 'How to experience Lagos like a local, not a tourist',
		excerpt:
			'Skip the landmarks list. Here\u2019s how to actually spend three days in Lagos the way people who live there do \u2014 danfo rides included.',
		category: 'Guides',
		destination: 'Lagos, Nigeria',
		readTime: 7,
		date: '2026-07-14',
		image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1600&q=80',
		featured: true,
		content: [
			'Most first-time visitors to Lagos try to see everything in three days \u2014 Lekki, Victoria Island, the mainland, a beach, a market \u2014 and end up seeing none of it properly. The city rewards a slower approach.',
			'Start on the mainland, not the island. Yaba\u2019s tech and creative scene, the old railway compound in Ebute Metta, and Balogun Market give you a far more honest read on the city than the polished stretch of Victoria Island most itineraries lead with.',
			'Take a danfo at least once. It\u2019s not comfortable, and that\u2019s the point \u2014 it\u2019s how most of the city actually moves, and the conductor calling out stops is a small piece of Lagos you won\u2019t get from a private car.',
			'Eat where the queue is, not where the menu is in English. The best suya spot we send people to has no signage at all \u2014 just a line of people who already know.',
			'Give the evening to Afrobeats, literally. A live set at a small venue on the mainland will tell you more about the city\u2019s current mood than any museum will.'
		]
	},
	{
		slug: 'ghana-beyond-accra',
		title: 'A first-timer\u2019s guide to Ghana beyond Accra',
		excerpt: 'Cape Coast, Kumasi and the towns guidebooks skip entirely \u2014 where to go once you\u2019ve done the capital.',
		category: 'Guides',
		destination: 'Ghana',
		readTime: 6,
		date: '2026-07-02',
		image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Accra is a reasonable place to start, but it\u2019s not where Ghana\u2019s story actually lives. Give it a day, then head to the coast.',
			'Cape Coast and Elmina hold two of the most significant \u2014 and heaviest \u2014 sites on the West African coast. Go with a guide who can hold the weight of that history properly; it\u2019s not a place to rush through.',
			'Kumasi, the Ashanti heartland, moves at a completely different pace from the capital. The markets alone are worth a full day, and the royal history here runs deeper than most visitors expect.'
		]
	},
	{
		slug: 'tanzania-beyond-safari',
		title: 'Why Tanzania is more than safari',
		excerpt: 'Zanzibar\u2019s spice farms, the coast, and the parts of the country most itineraries never touch.',
		category: 'Stories',
		destination: 'Tanzania',
		readTime: 5,
		date: '2026-06-20',
		image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Say "Tanzania" and most people picture the Serengeti. Fair \u2014 but the country\u2019s coastline is doing something entirely different, and just as worth the trip.',
			'Zanzibar\u2019s spice farms aren\u2019t a tourist gimmick; the island genuinely built its economy on cloves, and a walk through a working farm explains more about the region\u2019s trade history than any museum plaque.',
			'Pair four days of safari with four on the coast and you get two completely different countries in one trip \u2014 which is really the point.'
		]
	},
	{
		slug: 'accra-street-food',
		title: 'Street food you have to try in Accra',
		excerpt: 'Waakye stalls, kelewele carts and the corner spots locals actually queue for.',
		category: 'Food',
		destination: 'Accra, Ghana',
		readTime: 4,
		date: '2026-06-11',
		image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Waakye for breakfast, kelewele by the roadside come evening \u2014 Accra\u2019s best food rarely has a sign, just a line.',
			'Ask your guide for the stall nearest their own house, not the one in the guidebook. It\u2019s a reliable trick that works in almost every city we run.'
		]
	},
	{
		slug: 'zanzibar-weekend',
		title: 'A weekend guide to Zanzibar',
		excerpt: 'Stone Town in a day, the coast in two more \u2014 a realistic weekend itinerary that doesn\u2019t rush it.',
		category: 'Guides',
		destination: 'Zanzibar, Tanzania',
		readTime: 8,
		date: '2026-05-29',
		image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Give Stone Town its own full day \u2014 the alleys are made for getting lost in on purpose, and rushing it defeats the point.',
			'Spend the remaining two days on the northeast coast, where the water is calmest and the pace drops considerably.'
		]
	},
	{
		slug: 'lagos-art-scene',
		title: 'Inside Lagos\u2019 art and design scene',
		excerpt: 'From Yaba studios to Victoria Island galleries \u2014 where the city\u2019s creative class actually gathers.',
		category: 'Culture',
		destination: 'Lagos, Nigeria',
		readTime: 6,
		date: '2026-05-15',
		image: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Lagos\u2019 creative class doesn\u2019t cluster in one neighborhood \u2014 Yaba\u2019s studios, Victoria Island\u2019s galleries, and a growing scene on the mainland all pull from different corners of the city\u2019s energy.',
			'The best way in is a gallery opening, not a museum \u2014 that\u2019s where the actual conversations happen.'
		]
	},
	{
		slug: 'cape-town-sunsets',
		title: 'Where to watch the sunset in Cape Town',
		excerpt: 'Signal Hill gets crowded. Here are five quieter spots with the same view, minus the tour buses.',
		category: 'Tips',
		destination: 'Cape Town, South Africa',
		readTime: 3,
		date: '2026-04-30',
		image: '/images/assets/cape-town-2.webp',
		content: [
			'Signal Hill is the obvious choice, and it shows \u2014 tour buses arrive an hour before sunset most evenings.',
			'A short walk further along the same ridge gets you the identical view with a fraction of the crowd.'
		]
	},
	{
		slug: 'kenya-beyond-safari-circuit',
		title: 'Kenya beyond the safari circuit',
		excerpt: 'Nairobi\u2019s coffee culture, the highlands, and a country that\u2019s more than one national park.',
		category: 'Stories',
		destination: 'Kenya',
		readTime: 7,
		date: '2026-04-18',
		image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Nairobi is a working city first, and its coffee culture is genuinely some of the best on the continent \u2014 worth two days before you head into the bush.',
			'The highlands beyond the city offer a completely different Kenya from what most safari itineraries show you.'
		]
	},
	{
		slug: 'rwanda-slow-travel',
		title: 'A slow travel guide to Rwanda',
		excerpt: 'Why we tell people to spend fewer days doing more, and more days doing less, in Kigali and beyond.',
		category: 'Tips',
		destination: 'Rwanda',
		readTime: 5,
		date: '2026-03-27',
		image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
		content: [
			'Rwanda rewards a slower pace more than almost anywhere else we run trips \u2014 Kigali\u2019s calm is part of the experience, not an obstacle to it.',
			'Resist the urge to pack the itinerary. Fewer stops, more time at each, is the whole philosophy here.'
		]
	}
];

export function getArticleBySlug(slug: string): Article | undefined {
	return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(current: Article, limit = 3): Article[] {
	return articles
		.filter((a) => a.slug !== current.slug && (a.category === current.category || a.destination === current.destination))
		.slice(0, limit);
}