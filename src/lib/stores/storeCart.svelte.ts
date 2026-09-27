import { browser } from '$app/environment';

export interface CartItem {
	id: string; // product slug
	category: 'magazine' | 'merchandise';
	title: string;
	price: number;
	image: string;
	quantity: number;
	variant?: string;
}

const STORAGE_KEY = 'gt-store-cart';

function readFromStorage(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		// Corrupt or blocked storage — start empty rather than crash the page.
		return [];
	}
}

function writeToStorage(items: CartItem[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Storage full or blocked (private mode, etc.) — fail silently, cart still works in-memory.
	}
}

function createStoreCart() {
	// On the server this starts empty (correct — there's no per-user cart during SSR).
	// In the browser it's rehydrated immediately from localStorage below.
	let items = $state<CartItem[]>([]);
	let hydrated = false;

	function hydrate() {
		if (hydrated || !browser) return;
		hydrated = true;
		items = readFromStorage();
	}

	function persist() {
		writeToStorage(items);
	}

	function keyFor(id: string, variant?: string) {
		return variant ? `${id}::${variant}` : id;
	}

	function findIndex(id: string, variant?: string) {
		const key = keyFor(id, variant);
		return items.findIndex((item) => keyFor(item.id, item.variant) === key);
	}

	return {
		get items() {
			return items;
		},

		get count() {
			return items.reduce((sum, item) => sum + item.quantity, 0);
		},

		get subtotal() {
			return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		},

		get hasMerchandise() {
			return items.some((item) => item.category === 'merchandise');
		},

		get hasMagazine() {
			return items.some((item) => item.category === 'magazine');
		},

		has(id: string, variant?: string) {
			return findIndex(id, variant) !== -1;
		},

		// Call once from the root layout's onMount so the cart survives a refresh.
		hydrate,

		// Magazines: quantity is always 1 (you're buying access, not copies).
		// Merchandise: quantity can be increased.
		add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
			const qty = item.category === 'magazine' ? 1 : quantity;
			const index = findIndex(item.id, item.variant);

			if (index !== -1) {
				if (item.category === 'merchandise') {
					items[index].quantity += qty;
					items = [...items];
					persist();
				}
				return;
			}

			items = [...items, { ...item, quantity: qty }];
			persist();
		},

		remove(id: string, variant?: string) {
			items = items.filter((item) => keyFor(item.id, item.variant) !== keyFor(id, variant));
			persist();
		},

		setQuantity(id: string, quantity: number, variant?: string) {
			const index = findIndex(id, variant);
			if (index === -1) return;
			if (quantity <= 0) {
				this.remove(id, variant);
				return;
			}
			items[index].quantity = quantity;
			items = [...items];
			persist();
		},

		clear() {
			items = [];
			persist();
		}
	};
}

export const storeCart = createStoreCart();
