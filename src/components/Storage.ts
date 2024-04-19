import { IBasket, IBasketContacts, IBasketOrder, IOrder, IProduct } from '../types';
import { IEvents } from './base/events';

export class Storage {
	protected _basket: IBasket;
	protected _products: IProduct[];
	protected _order: IBasketOrder;
	protected _contacts: IBasketContacts;

	constructor(protected events: IEvents) {
		this.clearBasket();
		this.clearOrder();
		this.clearContacts();
	}

	set products(items: IProduct[]) {
		this._products = items;
		this.events.emit('products:changed', this.products);
	}

	get products(): IProduct[] {
		return this._products;
	}

	getProductById(id: string): IProduct {
		const product = this.products.find((item) => item.id === id);

		if (!product)
			throw Error(`Product with id ${id} not found`);

		return product;
	}

	protected set basket(basket: IBasket) {
		this._basket = basket;
		this.events.emit('basket:changed', this.basket);
	}

	get basket(): IBasket {
		return this._basket;
	}

	clearBasket() {
		this.basket = {
			items: [],
			total: 0,
		};
	}

	clearOrder() {
		this._order = {
			address: '', payment: undefined,
		};
	}

	clearContacts() {
		this.contacts = {
			email: '',
			phone: '',
		};
	}

	addProductToBasket(product: IProduct): void {
		if (this.isInBasket(product.id))
			return;

		this.basket = {
			items: [...this.basket.items, product.id],
			total: this.basket.total + product.price ?? 0,
		};
	}

	removeProductFromBasket(productId: string): void {
		if (!this.isInBasket(productId))
			return;

		const product = this.getProductById(productId);

		this.basket = {
			items: this.basket.items.filter(item => item !== product.id),
			total: this.basket.total - product.price ?? 0,
		};
	}

	getProductsInBasket(): IProduct[] {
		return this.products.filter((item) => this.isInBasket(item.id));
	}

	isInBasket(productId: string): boolean {
		return this.basket.items.includes(productId);
	}

	set order(basketOrder: IBasketOrder) {
		this._order = basketOrder;
	}

	get order() {
		return this._order;
	}

	set contacts(value: IBasketContacts) {
		this._contacts = value;
	}

	get contacts() {
		return this._contacts;
	}

	getCurrentOrder(): IOrder {
		const items = this.basket.items.filter((id) => this.getProductById(id).price > 0);

		return {
			address: this.order.address,
			email: this.contacts.email,
			items: items,
			payment: this.order.payment,
			phone: this.contacts.phone,
			total: this.basket.total,
		};
	}
}