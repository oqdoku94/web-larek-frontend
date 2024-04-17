import { IBasket, IUserInfo, ProductModel } from '../types';
import { IEvents } from './base/events';

export class Store {
	protected _basket: IBasket;
	protected _products: ProductModel[];
	protected userInfo: IUserInfo;

	constructor(protected events: IEvents) {

		this.basket = {
			items: new Map<string, number>,
			total: 0,
		};
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

	set basket(basket: IBasket) {
		this._basket = basket;
		this.events.emit('basket:changed', this.basket);
	}

	get basket(): IBasket {
		return this._basket;
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

		this.basket.items.delete(productId);
		this.basket = {
			items: this.basket.items,
			total: this.basket.total - this.basket.items.get(productId),
		};
	}

	isInBasket(productId: string): boolean {
		return this.basket.items.has(productId);
	}
}