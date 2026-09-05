export interface TourListItem {
	id: string;
	slug: string;
	title: string;
	image: string;
	price: number;
	deposit: number;
	travelers: number;
	duration?: string;
	country?: string;
}

const STORAGE_KEY = 'gidi-tour-list';

function load(): TourListItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as TourListItem[]) : [];
	} catch {
		return [];
	}
}

class TourStore {
	items = $state<TourListItem[]>(load());
	sidebarOpen = $state(false);

	get count(): number {
		return this.items.length;
	}

	get totalPrice(): number {
		return this.items.reduce((sum, item) => sum + item.price * item.travelers, 0);
	}

	get totalDeposit(): number {
		return this.items.reduce((sum, item) => sum + item.deposit * item.travelers, 0);
	}

	has(id: string): boolean {
		return this.items.some((item) => item.id === id);
	}

	add(tour: TourListItem): void {
		if (this.has(tour.id)) return;
		this.items = [...this.items, tour];
		this.#persist();
	}

	remove(id: string): void {
		this.items = this.items.filter((item) => item.id !== id);
		this.#persist();
	}

	toggle(tour: TourListItem): void {
		if (this.has(tour.id)) {
			this.remove(tour.id);
		} else {
			this.add(tour);
		}
	}

	updateTravelers(id: string, travelers: number): void {
		this.items = this.items.map((item) =>
			item.id === id ? { ...item, travelers: Math.max(1, travelers) } : item
		);
		this.#persist();
	}

	clear(): void {
		this.items = [];
		this.#persist();
	}

	openSidebar(): void {
		this.sidebarOpen = true;
	}

	closeSidebar(): void {
		this.sidebarOpen = false;
	}

	toggleSidebar(): void {
		this.sidebarOpen = !this.sidebarOpen;
	}

	#persist(): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
	}
}

export const tourStore = new TourStore();