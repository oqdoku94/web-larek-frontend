export interface IShopApi {
	getAllProducts(): Promise<IProduct[]>;

	getProductById(id: string): Promise<IProduct>;

	addOrder(order: IOrder): Promise<ISuccessOrder>;
}

export type IPay = 'card' | 'cash';

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price?: number;
}

export interface IBasketOrder {
	payment: IPay;
	address: string;
}

export interface IBasketContacts {
	email: string;
	phone: string;
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface ISuccessOrder {
	id: string;
	total: number;
}

export interface ICard {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price?: number;
	isInBasket: boolean;
	index: number;
}

export interface ICardAction {
	onClick: (event: MouseEvent) => void;
}

export interface IBasket {
	price: number;
	cards: HTMLElement[];
}

