export type Region = 'West Africa' | 'East Africa' | 'North Africa' | 'Southern Africa' | 'Europe';

export type City = { name: string; blurb: string; image: string; gallery: string[] };
export type Experience = { title: string; blurb: string; image: string; href?: string };

export type Country = {
	slug: string;
	name: string;
	region: Region;
	heroImage: string;
	intro: string;
	bestTime: string;
	duration: string;
	priceFrom: string;
	cities: City[];
	thingsToDo: string[];
	experiences: Experience[];
	food: { name: string; desc: string }[];
	travelTips: string[];
};

export const regions: Region[] = [
	'West Africa',
	'East Africa',
	'North Africa',
	'Southern Africa',
	'Europe'
];

export const countries: Country[] = [
	{
		slug: 'nigeria',
		name: 'Nigeria',
		region: 'West Africa',
		heroImage:
			'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1800&q=80',
		intro:
			'Nigeria doesn\u2019t hand you an easy trip \u2014 it hands you a real one. Afrobeats in every taxi, jollof arguments at every table, and a creative energy that\u2019s impossible to fake your way through. This isn\u2019t one city\u2019s story; it\u2019s several, and they don\u2019t agree with each other.',
		bestTime: 'Nov \u2013 Feb',
		duration: '5\u201312 days',
		priceFrom: '$980',
		cities: [
			{
				name: 'Lagos',
				blurb: 'Fast, loud, unforgettable \u2014 the commercial heart.',
				image:
					'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=900&q=80',
				gallery: [
					'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
				]
			},
			{
				name: 'Abuja',
				blurb: 'The planned capital \u2014 wide roads, quieter pace.',
				image:
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=900&q=80',
				gallery: [
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
				]
			},
			{
				name: 'Calabar',
				blurb: 'Carnival energy and a coastal, colonial past.',
				image:
					'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
				gallery: [
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
				]
			},
			{
				name: 'Kano',
				blurb: 'The old north \u2014 ancient city walls, dye pits, history.',
				image:
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80',
				gallery: [
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
				]
			},
			{
				name: 'Jos',
				blurb: 'Cool highland air and a totally different landscape.',
				image:
					'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Ibadan',
				blurb: 'One of West Africa\u2019s oldest, largest indigenous cities.',
				image:
					'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Ride a danfo across Lagos at least once \u2014 uncomfortable, and exactly how the city actually moves.',
			'Walk the old city walls and dye pits of Kano, some of the oldest surviving in West Africa.',
			'Catch a live Afrobeats set on the mainland, not a tourist-facing venue on the island.',
			'Spend a morning at a Lagos art gallery in Yaba or Victoria Island.',
			'Take in the cooler air and rock formations around Jos.'
		],
		experiences: [
			{
				title: 'Lagos Like a Local',
				blurb:
					'Three days built around the mainland, the food, and the music \u2014 not the landmarks list.',
				image:
					'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			},
			{
				title: 'Northern Nigeria Heritage',
				blurb: 'Kano\u2019s old city, the dye pits, and centuries of trade history.',
				image:
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Jollof rice',
				desc: 'The dish every region insists it does best. Try it in more than one city and decide for yourself.'
			},
			{
				name: 'Suya',
				desc: 'Spiced skewered meat from roadside grills \u2014 best found by following the queue, not the signage.'
			},
			{
				name: 'Pounded yam & egusi',
				desc: 'A staple across the south \u2014 hearty, communal, usually eaten with your hands.'
			}
		],
		travelTips: [
			'Traffic in Lagos is real \u2014 build buffer time into any cross-city plan.',
			'The Harmattan haze (Nov\u2013Feb) is dry-season dust, not pollution \u2014 pack for it, not against it.',
			'English is widely spoken, but a greeting in Yoruba, Hausa or Igbo goes a long way depending on region.'
		]
	},
	{
		slug: 'ghana',
		name: 'Ghana',
		region: 'West Africa',
		heroImage:
			'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1800&q=80',
		intro:
			'Slower than Lagos, warmer for it. Ghana carries its history in layers \u2014 coastal forts heavy with memory, kente cloth traditions, and kitchens that don\u2019t rush. It rewards travelers who give it more than a weekend.',
		bestTime: 'Aug \u2013 Oct',
		duration: '4\u20139 days',
		priceFrom: '$860',
		cities: [
			{
				name: 'Accra',
				blurb: 'The capital \u2014 markets, nightlife, a growing creative scene.',
				image:
					'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Cape Coast',
				blurb: 'Coastal forts carrying the weight of history.',
				image:
					'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Kumasi',
				blurb: 'The Ashanti heartland \u2014 royal history, deep markets.',
				image:
					'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Visit Cape Coast and Elmina castles with a guide who can hold the weight of that history properly.',
			'Walk Kejetia Market in Kumasi, one of the largest in West Africa.',
			'Watch kente cloth being woven by hand near Kumasi.',
			'Spend an evening in Accra\u2019s Osu neighborhood for food and nightlife.'
		],
		experiences: [
			{
				title: 'Ghana Beyond Accra',
				blurb: 'Cape Coast, Kumasi, and the towns most guidebooks skip.',
				image:
					'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Waakye',
				desc: 'Rice and beans cooked with dried leaves \u2014 an Accra breakfast staple.'
			},
			{
				name: 'Kelewele',
				desc: 'Spiced fried plantain, best from a roadside cart in the evening.'
			},
			{
				name: 'Banku & tilapia',
				desc: 'Fermented corn/cassava dough with grilled fish \u2014 a coastal classic.'
			}
		],
		travelTips: [
			'Book Cape Coast castle tours ahead in peak season \u2014 slots fill up.',
			'Small bills matter in local markets; breaking large notes can be difficult.',
			'Akan greetings are appreciated even if brief \u2014 it changes how you\u2019re received.'
		]
	},
	{
		slug: 'kenya',
		name: 'Kenya',
		region: 'East Africa',
		heroImage:
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1800&q=80',
		intro:
			'A working city and a safari gateway, in that order. Kenya is more than one national park \u2014 the highlands, the coffee culture, and Nairobi\u2019s own rhythm deserve time before you head into the bush.',
		bestTime: 'Jul \u2013 Oct',
		duration: '6\u201310 days',
		priceFrom: '$1,240',
		cities: [
			{
				name: 'Nairobi',
				blurb: 'Coffee culture and the highlands, before the safari.',
				image:
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Maasai Mara',
				blurb: 'The Great Migration and the driest, easiest game viewing.',
				image:
					'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Mombasa',
				blurb: 'The coast \u2014 a different Kenya entirely.',
				image:
					'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Spend two days in Nairobi before heading into the bush \u2014 the coffee scene alone is worth it.',
			'Time a Maasai Mara visit for July\u2013October to catch the river crossings.',
			'Break up a safari trip with a few coastal days in Mombasa.'
		],
		experiences: [
			{
				title: 'Kenya Beyond the Safari Circuit',
				blurb: 'Nairobi\u2019s highlands and coffee culture, not just one national park.',
				image:
					'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Nyama choma',
				desc: 'Grilled meat, usually goat \u2014 a communal, unhurried meal.'
			},
			{ name: 'Ugali', desc: 'A maize staple served with almost everything.' },
			{
				name: 'Kenyan coffee',
				desc: 'Genuinely some of the best on the continent \u2014 worth a dedicated morning.'
			}
		],
		travelTips: [
			'April\u2013May long rains can close some park roads entirely \u2014 avoid for safari trips.',
			'Tipping guides and drivers is customary and expected on safari.',
			'Pack layers \u2014 highland mornings are cold even near the equator.'
		]
	},
	{
		slug: 'tanzania',
		name: 'Tanzania',
		region: 'East Africa',
		heroImage:
			'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80',
		intro:
			'Say "Tanzania" and most people picture the Serengeti. Fair \u2014 but Zanzibar\u2019s spice-scented coastline is doing something entirely different, and just as worth the trip.',
		bestTime: 'Jun \u2013 Oct',
		duration: '4\u201310 days',
		priceFrom: '$1,050',
		cities: [
			{
				name: 'Zanzibar (Stone Town)',
				blurb: 'Alleys that smell like cloves and salt water.',
				image:
					'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Arusha',
				blurb: 'Gateway to the northern safari circuit.',
				image:
					'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Serengeti',
				blurb: 'Peak wildlife viewing in the dry season.',
				image:
					'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Walk a working spice farm outside Stone Town.',
			'Get lost in Stone Town\u2019s alleys on purpose \u2014 that\u2019s the point.',
			'Time a Serengeti visit for June\u2013October for the driest game viewing.'
		],
		experiences: [
			{
				title: 'Why Tanzania Is More Than Safari',
				blurb: 'Wildlife on one side, spice-scented coastline on the other.',
				image:
					'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Zanzibar pizza',
				desc: 'A street-food staple \u2014 nothing like Italian pizza, and better for it.'
			},
			{
				name: 'Pilau',
				desc: 'Spiced rice reflecting the island\u2019s trade history with the spice route.'
			}
		],
		travelTips: [
			'March\u2013May long rains make safari roads genuinely difficult \u2014 plan around them.',
			'Dress modestly in Stone Town out of respect for local customs.'
		]
	},
	{
		slug: 'rwanda',
		name: 'Rwanda',
		region: 'East Africa',
		heroImage:
			'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80',
		intro:
			'The cleanest capital you\u2019ll visit on the continent, and one of the most honest about its own history. Rwanda rewards a slower pace more than almost anywhere else we run trips.',
		bestTime: 'Jun \u2013 Aug',
		duration: '5\u20138 days',
		priceFrom: '$1,480',
		cities: [
			{
				name: 'Kigali',
				blurb: 'Green hills, quiet mornings, honest history.',
				image:
					'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Volcanoes National Park',
				blurb: 'Gorilla trekking, if you go further out.',
				image:
					'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Visit the Kigali Genocide Memorial \u2014 essential context for the country\u2019s present.',
			'Trek to see mountain gorillas in Volcanoes National Park.',
			'Walk Kigali\u2019s hills at a genuinely unhurried pace \u2014 resist over-packing the itinerary.'
		],
		experiences: [
			{
				title: 'A Slow Travel Guide to Rwanda',
				blurb: 'Fewer stops, more time at each \u2014 the whole philosophy here.',
				image:
					'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{ name: 'Ubugali', desc: 'A cassava/maize staple, similar to ugali, served with stew.' },
			{ name: 'Rwandan coffee', desc: 'High-altitude, increasingly world-renowned.' }
		],
		travelTips: [
			'Gorilla trekking permits sell out \u2014 book well ahead of your dates.',
			'Plastic bags are banned nationally \u2014 pack accordingly.'
		]
	},
	{
		slug: 'egypt',
		name: 'Egypt',
		region: 'North Africa',
		heroImage: 'images/assets/cairo.webp',
		intro:
			'Loud, ancient, and completely unbothered by your expectations. The pyramids are the easy part \u2014 the real story is in the markets and the Nile at sunset.',
		bestTime: 'Oct \u2013 Apr',
		duration: '5\u20139 days',
		priceFrom: '$1,120',
		cities: [
			{
				name: 'Cairo',
				blurb: 'The pyramids, the markets, the Nile at sunset.',
				image: 'images/assets/cairo.webp',
                gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Luxor',
				blurb: 'The Valley of the Kings and ancient temple complexes.',
				image:
					'https://images.unsplash.com/photo-1568322445389-f64ac9c4382e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Aswan',
				blurb: 'A quieter Nile city, Nubian culture and river life.',
				image:
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'See the pyramids early, before the heat and the crowds.',
			'Take a felucca sailboat ride on the Nile at sunset.',
			'Walk Khan el-Khalili market in Cairo for spices, textiles and tea.',
			'Visit the Valley of the Kings in Luxor with a knowledgeable guide.'
		],
		experiences: [
			{
				title: 'Cairo & the Nile',
				blurb: 'Pyramids, markets, and river life beyond the postcard shots.',
				image: 'images/assets/cairo.webp',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Koshari',
				desc: 'Rice, lentils, pasta and fried onions \u2014 Cairo\u2019s beloved street staple.'
			},
			{ name: 'Ful medames', desc: 'Slow-cooked fava beans, a breakfast institution.' }
		],
		travelTips: [
			'October\u2013April avoids the harshest desert heat.',
			'Bargaining is expected in markets \u2014 approach it as part of the experience, not a chore.'
		]
	},
	{
		slug: 'morocco',
		name: 'Morocco',
		region: 'North Africa',
		heroImage:
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1800&q=80',
		intro:
			'The souks will get you lost on purpose. Ride it out \u2014 that\u2019s where the good tea, the good leather, and the good stories actually happen.',
		bestTime: 'Mar \u2013 May, Sep \u2013 Nov',
		duration: '4\u20138 days',
		priceFrom: '$940',
		cities: [
			{
				name: 'Marrakech',
				blurb: 'Souks, riads and the gateway to the Sahara.',
				image:
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Fez',
				blurb: 'The oldest medina, tanneries and centuries of craft.',
				image:
					'https://images.unsplash.com/photo-1568322445389-f64ac9c4382e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Chefchaouen',
				blurb: 'The blue city in the Rif mountains.',
				image:
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Get lost in the Marrakech medina, then let a local guide lead you back.',
			'Visit the Fez tanneries \u2014 ask for fresh mint at the entrance, you\u2019ll understand why.',
			'Spend a night in the Sahara under a genuinely dark sky.',
			'Wander Chefchaouen\u2019s blue-washed alleys at golden hour.'
		],
		experiences: [
			{
				title: 'When to Visit Morocco',
				blurb:
					'Spring and autumn \u2014 warm days, cool desert nights, before the summer heat hits.',
				image:
					'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{ name: 'Tagine', desc: 'Slow-cooked stew named for the clay pot it\u2019s made in.' },
			{
				name: 'Mint tea',
				desc: 'Poured from height, offered constantly \u2014 accept it, it\u2019s hospitality.'
			}
		],
		travelTips: [
			'July\u2013August heat toward the Sahara is genuinely punishing \u2014 avoid if possible.',
			'Dress modestly outside resort areas, especially in medinas.'
		]
	},
	{
		slug: 'south-africa',
		name: 'South Africa',
		region: 'Southern Africa',
		heroImage: 'images/assets/cape-town-1.webp',
		intro:
			'A country that argues with its own coastline and wins. Table Mountain on one side, the winelands twenty minutes the other way. Bring layers.',
		bestTime: 'Nov \u2013 Mar',
		duration: '6\u201312 days',
		priceFrom: '$1,360',
		cities: [
			{
				name: 'Cape Town',
				blurb: 'Table Mountain, the coastline, and the winelands nearby.',
				image: 'images/assets/cape-town-1.webp',
                gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Johannesburg',
				blurb: 'History, culture and the gateway to safari country.',
				image:
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Kruger',
				blurb: 'World-class safari, self-drive or guided.',
				image:
					'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Ride the cable car (or hike) up Table Mountain on a clear day.',
			'Spend a day in the Cape Winelands \u2014 Stellenbosch or Franschhoek.',
			'Visit the Apartheid Museum in Johannesburg for essential context.',
			'Go on a guided safari drive in Kruger National Park.'
		],
		experiences: [
			{
				title: 'Cape Town Sunsets',
				blurb: 'Signal Hill gets crowded \u2014 we know five quieter spots with the same view.',
				image: 'images/assets/cape-town-2.webp',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Braai',
				desc: 'South African barbecue \u2014 a genuine social institution, not just a meal.'
			},
			{ name: 'Bobotie', desc: 'Spiced minced meat bake with a golden egg topping.' }
		],
		travelTips: [
			'Bring layers year-round \u2014 Cape Town weather shifts fast, even in summer.',
			'Self-driving in Kruger is an option, but a guided drive spots far more wildlife.'
		]
	},
	{
		slug: 'uk',
		name: 'United Kingdom',
		region: 'Europe',
		heroImage:
			'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=80',
		intro:
			'We built our UK route around the parts guidebooks skip \u2014 the markets, the immigrant neighborhoods, the pubs that haven\u2019t changed their menu since 1987.',
		bestTime: 'May \u2013 Sep',
		duration: '4\u20138 days',
		priceFrom: '$1,020',
		cities: [
			{
				name: 'London',
				blurb: 'Stories that go far beyond the landmarks.',
				image:
					'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Manchester',
				blurb: 'Music history and a proudly different pace from the capital.',
				image:
					'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			},
			{
				name: 'Edinburgh',
				blurb: 'A city built on hills, history and a famous festival.',
				image:
					'https://images.unsplash.com/photo-1568322445389-f64ac9c4382e?auto=format&fit=crop&w=900&q=80',
                    gallery: [
			'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1580060839134-75a50c8ca050?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'
		]
			}
		],
		thingsToDo: [
			'Spend a morning in Brixton or Peckham markets, not just central London.',
			'Find a pub that hasn\u2019t updated its menu since the \u201980s and order whatever\u2019s written in chalk.',
			'Walk Edinburgh\u2019s Old Town at dusk.',
			'Catch a small gig in Manchester\u2019s Northern Quarter.'
		],
		experiences: [
			{
				title: 'London Beyond the Landmarks',
				blurb: 'The markets, the neighborhoods, the pubs everyone skips.',
				image:
					'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
				href: '/book'
			}
		],
		food: [
			{
				name: 'Sunday roast',
				desc: 'A genuine institution \u2014 book ahead at a proper pub, not a chain.'
			},
			{
				name: 'Market street food',
				desc: 'Borough Market and its like reflect the city\u2019s immigrant food scenes far better than any single "British" dish.'
			}
		],
		travelTips: [
			'May\u2013September gives you the best odds against the rain, though nothing\u2019s guaranteed.',
			'The Tube is faster than a cab across central London almost always.'
		]
	}
];

export function getCountryBySlug(slug: string): Country | undefined {
	return countries.find((c) => c.slug === slug);
}
