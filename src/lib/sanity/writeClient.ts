import { createClient } from '@sanity/client';
import { SANITY_WRITE_TOKEN } from '$env/static/private';
import { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } from '$env/static/public'; // use your own names

export const writeClient = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	apiVersion: '2024-01-01',
	useCdn: false,
	token: SANITY_WRITE_TOKEN
});