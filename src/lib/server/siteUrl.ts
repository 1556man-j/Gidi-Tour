import { env } from '$env/dynamic/private';

// The public address of the site, used in links inside emails (password reset,
// email confirmation). It is fixed on purpose, never taken from the request, so a
// forged Host header can't make us email someone a link to another website.
// Set SITE_URL (for example https://staging.giditour.com) to override it.
export const SITE_URL = (env.SITE_URL || 'https://giditour.com').replace(/\/+$/, '');
