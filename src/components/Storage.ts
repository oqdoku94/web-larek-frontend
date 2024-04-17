import { IBasket, IBasketContacts, IBasketOrder, IPay, ProductModel } from '../types';
import { IEvents } from './base/events';

export class Storage {
	protected _basket: IBasket;
	protected _products: ProductModel[];
	protected _basketOrder: IBasketOrder;
	protected _basketContacts: IBasketContacts;

	constructor(protected events: IEvents) {
		this.clearBasket();
		this.clearBasketOrder();

		events.on('basketOrder:changed', (data : IBasketOrder) => this._basketOrder = data);
		events.on('basketContacts:changed', (data : IBasketContacts) => this._basketContacts = data);
	}

	set products(items: ProductModel[]) {
		this._products = items.sort((a, b) => {
			if (a.id < b.id)
				return -1;

			return a.id > b.id ? 1 : -1;
		});
		this.events.emit('product:changed');
	}

	get products(): ProductModel[] {
		return this._products;
	}

	getProductById(id: string): ProductModel {
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
			items: new Map<string, number>,
			total: 0,
		};
	}

	addProductToBasket(productId: string, price: number): void {
		if (this.isInBasket(productId))
			return;

		this.basket.items.set(productId, price);
		this.basket = {
			items: this.basket.items,
			total: this.basket.total + this.basket.items.get(productId),
		};
	}

	removeProductFromBasket(productId: string): void {
		if (!this.isInBasket(productId))
			return;

		const lastPrice = this.basket.items.get(productId);
		this.basket.items.delete(productId);
		this.basket = {
			items: this.basket.items,
			total: this.basket.total - lastPrice,
		};
	}

	isInBasket(productId: string): boolean {
		return this.basket.items.has(productId);
	}

	get basketOrder() {
		return this._basketOrder;
	}

	clearBasketOrder() {
		this._basketOrder = {
			address: '', payment: undefined,
		};
	}

	clearBasketContacts() {
		this._basketContacts = {
			email: '',
			phone: ''
		}
	}

	get basketContacts() {
		return this._basketContacts;
	}
}