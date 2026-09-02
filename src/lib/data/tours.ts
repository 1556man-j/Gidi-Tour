export type TourCategory = 'City Break' | 'Safari' | 'Cultural' | 'Coastal' | 'Adventure' | 'Group';

export type Tour = {
	slug: string;
	title: string;
	country: string;
	countrySlug: string;
	category: TourCategory;
	image: string;
	gallery: string[];
	duration: string;
	groupSize: string;
	price: number; // per person, USD
	deposit: number; // required to hold a spot
	rating: number;
	reviewCount: number;
	summary: string;
	highlights: string[];
	includes: string[];
	popular?: boolean;
};

export const tourCategories: TourCategory[] = ['City Break', 'Safari', 'Cultural', 'Coastal', 'Adventure', 'Group'];

export const tours: Tour[] = [
	{
		slug: 'lagos-like-a-local',
		title: 'Lagos Like a Local',
		country: 'Nigeria',
		countrySlug: 'nigeria',
		category: 'City Break',
		image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '5 days',
		groupSize: '2–8 people',
		price: 980,
		deposit: 200,
		rating: 4.9,
		reviewCount: 84,
		summary: 'Three days on the mainland, the food scene, and the music — not the landmarks list.',
		highlights: ['Danfo ride through the city', 'Yaba art & design tour', 'Suya crawl by night', 'Afrobeats live set'],
		includes: ['4 nights accommodation', 'Local guide throughout', 'All ground transport', 'Daily breakfast'],
		popular: true
	},
	{
		slug: 'ghana-beyond-accra',
		title: 'Ghana Beyond Accra',
		country: 'Ghana',
		countrySlug: 'ghana',
		category: 'Cultural',
		image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '6 days',
		groupSize: '2–10 people',
		price: 860,
		deposit: 180,
		rating: 4.8,
		reviewCount: 61,
		summary: 'Cape Coast, Kumasi, and the towns most guidebooks skip entirely.',
		highlights: ['Cape Coast & Elmina castles', 'Kejetia Market, Kumasi', 'Kente weaving demonstration', 'Osu nightlife evening'],
		includes: ['5 nights accommodation', 'Local guide throughout', 'Coastal transfers', 'Daily breakfast'],
	},
	{
		slug: 'kenya-safari-highlands',
		title: 'Kenya Safari & Highlands',
		country: 'Kenya',
		countrySlug: 'kenya',
		category: 'Safari',
		image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '8 days',
		groupSize: '4–12 people',
		price: 1240,
		deposit: 300,
		rating: 5.0,
		reviewCount: 47,
		summary: 'Nairobi\u2019s highlands and coffee culture, then the Maasai Mara at peak migration.',
		highlights: ['Nairobi coffee tour', 'Maasai Mara game drives', 'Great Migration river crossing (seasonal)', 'Maasai village visit'],
		includes: ['7 nights accommodation', 'Safari vehicle & driver-guide', 'All park fees', 'Full board on safari'],
		popular: true
	},
	{
		slug: 'zanzibar-weekend',
		title: 'Zanzibar Coastal Escape',
		country: 'Tanzania',
		countrySlug: 'tanzania',
		category: 'Coastal',
		image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '5 days',
		groupSize: '2–8 people',
		price: 1050,
		deposit: 220,
		rating: 4.9,
		reviewCount: 39,
		summary: 'Stone Town in a day, the coast in three more — a realistic pace that doesn\u2019t rush it.',
		highlights: ['Stone Town walking tour', 'Working spice farm visit', 'Northeast coast beach days', 'Sunset dhow cruise'],
		includes: ['4 nights accommodation', 'Local guide in Stone Town', 'Airport transfers', 'Daily breakfast']
	},
	{
		slug: 'rwanda-slow-travel',
		title: 'Rwanda Slow Travel',
		country: 'Rwanda',
		countrySlug: 'rwanda',
		category: 'Cultural',
		image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '6 days',
		groupSize: '2–6 people',
		price: 1480,
		deposit: 350,
		rating: 5.0,
		reviewCount: 28,
		summary: 'Fewer stops, more time at each — Kigali\u2019s calm and gorilla trekking beyond.',
		highlights: ['Kigali Genocide Memorial', 'Mountain gorilla trekking', 'Lake Kivu morning', 'Local coffee cooperative visit'],
		includes: ['5 nights accommodation', 'Gorilla trekking permit', 'Private guide & driver', 'Full board'],
	},
	{
		slug: 'cairo-nile',
		title: 'Cairo & the Nile',
		country: 'Egypt',
		countrySlug: 'egypt',
		category: 'Cultural',
		image: 'images/assets/cairo.webp',
		gallery: ['images/assets/cairo.webp'],
		duration: '6 days',
		groupSize: '2–10 people',
		price: 1120,
		deposit: 240,
		rating: 4.8,
		reviewCount: 55,
		summary: 'Pyramids at sunrise, Khan el-Khalili market, and a felucca ride at sunset.',
		highlights: ['Giza pyramids at sunrise', 'Khan el-Khalili market', 'Nile felucca sunset sail', 'Egyptian Museum'],
		includes: ['5 nights accommodation', 'Egyptologist guide', 'All entry fees', 'Daily breakfast']
	},
	{
		slug: 'marrakech-sahara',
		title: 'Marrakech & the Sahara',
		country: 'Morocco',
		countrySlug: 'morocco',
		category: 'Adventure',
		image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80',
		gallery: [
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1568322445389-f64ac9c4382e?auto=format&fit=crop&w=1200&q=80'
		],
		duration: '7 days',
		groupSize: '2–10 people',
		price: 940,
		deposit: 200,
		rating: 4.9,
		reviewCount: 72,
		summary: 'Medina souks, Fez tanneries, and a night under a genuinely dark Sahara sky.',
		highlights: ['Marrakech medina & souks', 'Fez tanneries', 'Sahara camel trek & desert camp', 'Atlas Mountains crossing'],
		includes: ['6 nights accommodation', 'Private driver-guide', 'Desert camp with dinner', 'Daily breakfast'],
		popular: true
	},
	{
		slug: 'cape-town-winelands',
		title: 'Cape Town & Winelands',
		country: 'South Africa',
		countrySlug: 'south-africa',
		category: 'City Break',
		image: 'images/assets/cape-town-1.webp',
		gallery: ['images/assets/cape-town-1.webp', 'images/assets/cape-town-2.webp'],
		duration: '7 days',
		groupSize: '2–8 people',
		price: 1360,
		deposit: 300,
		rating: 4.9,
		reviewCount: 44,
		summary: 'Table Mountain, the coastline, and the winelands twenty minutes away.',
		highlights: ['Table Mountain cable car', 'Stellenbosch wine tasting', 'Cape Point & penguins', 'Bo-Kaap walking tour'],
		includes: ['6 nights accommodation', 'Local guide', 'Winelands day trip', 'Daily breakfast']
	},
	{
		slug: 'london-beyond-landmarks',
		title: 'London Beyond the Landmarks',
		country: 'United Kingdom',
		countrySlug: 'uk',
		category: 'City Break',
		image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
		gallery: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'],
		duration: '5 days',
		groupSize: '2–8 people',
		price: 1020,
		deposit: 220,
		rating: 4.7,
		reviewCount: 33,
		summary: 'The markets, the neighborhoods, and the pubs every guidebook skips.',
		highlights: ['Brixton & Peckham markets', 'Northern Quarter gig, Manchester day trip', 'A proper Sunday roast', 'Borough Market food tour'],
		includes: ['4 nights accommodation', 'Local guide', 'Oyster card top-up', 'Daily breakfast']
	}
];

export function getTourBySlug(slug: string): Tour | undefined {
	return tours.find((t) => t.slug === slug);
}