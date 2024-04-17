import { BaseModel } from '../components/base/BaseModel';
import { BaseComponent } from '../components/base/BaseComponent';
import { IEvents } from '../components/base/events';
import { ensureElement, setImage } from '../utils/utils';

/* start models */

export interface IShopApi {
	getAllProducts(): Promise<IProduct[]>;
	getProductById(id: string): Promise<IProduct>;
	addOrder(order: IOrder): Promise<ISuccessOrder>;
}

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price?: number;
}

export interface IBasket {
	items: Map<string, number>;
	total: number;
}

export interface IUserInfo {
	payment: string
	email: string
	phone: string
	address: string
}

export interface IOrder extends IBasket, IUserInfo {}

export interface ISuccessOrder {
	id: string;
	total: number;
}

export class ProductModel extends BaseModel<IProduct>{
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price?: number;
	get priceText() {
		return this.price ? `${this.price} синапсов` : 'Бесценно';
	}
}

/* end models */


/* start views */
export interface IView<T> {
	render(obj : T): HTMLElement;
}

interface ICard {
	id: string;
	title: string;
	priceText: string;
}

interface IBasketCard extends ICard {
	order: number;
}

export interface IPageCard extends ICard {
	category: string;
	image: string;
}

export interface IModalCard extends IPageCard {
	description: string;
	price: number;
	isInBasket: boolean;
}

abstract class CardView<T extends ICard> extends BaseComponent<T> {
	protected id: string;
	protected readonly titleElement: HTMLHeadingElement;
	protected readonly priceElement: HTMLSpanElement;

	protected constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.titleElement = ensureElement<HTMLHeadingElement>('.card__title', this.container);
		this.priceElement = ensureElement<HTMLSpanElement>('.card__price', this.container);
	}

	render(obj: T): HTMLElement {
		this.id = obj.id;
		this.titleElement.textContent = obj.title;
		this.priceElement.textContent = obj.priceText;

		return this.container;
	}
}

abstract class ImagedCardView<T extends IPageCard> extends CardView<T> {
	protected readonly categoryElement: HTMLSpanElement;
	protected readonly imageElement: HTMLImageElement;

	protected constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.categoryElement = ensureElement<HTMLSpanElement>('.card__category', this.container);
		this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
	}

	protected setCategory(category: string): void {
		this.categoryElement.textContent = category;

		switch (category){
			case 'другое':
				this.categoryElement.classList.add('card__category_other');
				break;
			case 'софт-скил':
				this.categoryElement.classList.add('card__category_soft');
				break;
			case 'дополнительное':
				this.categoryElement.classList.add('card__category_additional');
				break;
			case 'кнопка':
				this.categoryElement.classList.add('card__category_button');
				break;
			case 'хард-скил':
				this.categoryElement.classList.add('card__category_hard');
				break;
		}
	}

	render(obj: T): HTMLElement {
		super.render(obj);
		this.setCategory(obj.category)
		setImage(this.imageElement, obj.image);
		return this.container;
	}
}

export class PageCardView extends ImagedCardView<IPageCard> {
	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.container.addEventListener('click', () => { events.emit('product:selected', { id: this.id })})
	}
}

export class ModalCardView extends ImagedCardView<IModalCard> {
	protected descriptionElement: HTMLParagraphElement;
	protected buttonElement: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.descriptionElement = ensureElement<HTMLParagraphElement>('.card__text', this.container);
		this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);
	}

	protected setIsInBasketState(isInBasket: boolean): void {
		if (isInBasket) {
			this.buttonElement.textContent = 'Удалить';
			this.buttonElement.addEventListener('click', () => {
					this.events.emit('basket:remove', { id: this.id });
			});
		} else {
			this.buttonElement.textContent = 'В корзину';
			this.buttonElement.addEventListener('click', () => {
				this.events.emit('basket:add', { id: this.id });
			});
		}
	}

	render(obj: IModalCard): HTMLElement {
		super.render(obj);

		this.descriptionElement.textContent = obj.description;
		this.setIsInBasketState(obj.isInBasket);

		return this.container;
	}
}

/* end views */

