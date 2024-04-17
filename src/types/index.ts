import { BaseModel } from '../components/base/BaseModel';
import { BaseComponent } from '../components/base/BaseComponent';
import { IEvents } from '../components/base/events';
import { cloneTemplate, ensureElement, setImage } from '../utils/utils';

/* start models */

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

export interface IBasket {
	items: Map<string, number>;
	total: number;
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
	payment: string
	email: string
	phone: string
	address: string
	total: number
	items: string[]
}

export interface ISuccessOrder {
	id: string;
	total: number;
}

export class ProductModel extends BaseModel<IProduct> {
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
	render(obj: T): HTMLElement;
}

interface ICard {
	id: string;
	title: string;
	priceText: string;
}

interface IBasketCard extends ICard {
	order: number;
}

export interface IBasketCardList {
	items: IBasketCard[],
	total: number;
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

		switch (category) {
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
		this.setCategory(obj.category);
		setImage(this.imageElement, obj.image);
		return this.container;
	}
}

export class PageCardView extends ImagedCardView<IPageCard> {
	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.container.addEventListener('click', () => {
			events.emit('product:selected', { id: this.id });
		});
	}
}

export class ModalCardView extends ImagedCardView<IModalCard> {
	private isInBasket: boolean;
	protected descriptionElement: HTMLParagraphElement;
	protected buttonElement: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.descriptionElement = ensureElement<HTMLParagraphElement>('.card__text', this.container);
		this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);
	}

	protected setIsInBasketState(isInBasket: boolean): void {
		this.isInBasket = isInBasket;
		this.buttonElement.textContent = this.isInBasket ? 'Удалить' : 'В корзину';
		this.buttonElement.addEventListener('click', () => {
			this.events.emit(this.isInBasket ? 'basket:remove' : 'basket:add', { id: this.id });
			this.isInBasket = !this.isInBasket;
			this.buttonElement.textContent = this.isInBasket ? 'Удалить' : 'В корзину';
		});
	}

	render(obj: IModalCard): HTMLElement {
		super.render(obj);

		this.descriptionElement.textContent = obj.description;
		this.setIsInBasketState(obj.isInBasket);

		return this.container;
	}
}

export class BasketView extends BaseComponent<IBasketCardList>{
	protected basketCardListElement: HTMLUListElement;
	protected submitButton: HTMLButtonElement;
	protected priceElement: HTMLSpanElement;

	constructor(protected container: HTMLElement, protected events: IEvents, protected basketCardTemplate: HTMLTemplateElement, protected basketCardViewConstructor: IBasketCardViewConstructor) {
		super(container, events);

		this.basketCardListElement = ensureElement<HTMLUListElement>('.basket__list', this.container);
		this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
		this.priceElement = ensureElement<HTMLSpanElement>('.basket__price', this.container);

		this.submitButton.addEventListener('click', () => events.emit('modal:basket:submit'));
	}

	setPrice(price : number): void {
		this.priceElement.textContent = String(price) + ' синапсов';
	}

	render(obj: IBasketCardList): HTMLElement {

		if (!obj.items.length || !obj.total)
			this.submitButton.disabled = true;

		this.setPrice(obj.total);
		this.basketCardListElement.replaceChildren(...obj.items
			.map(cardItem =>
				new this.basketCardViewConstructor(cloneTemplate(this.basketCardTemplate), this.events)
					.render(cardItem)))
		return this.container;
	}
}

interface IBasketCardViewConstructor {
	new(container: HTMLElement, events: IEvents): CardView<IBasketCard>;
}

export class BasketCardView extends CardView<IBasketCard> {
	private itemIndexElement: HTMLSpanElement;
	protected removeButtonElement: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container, events);

		this.itemIndexElement = ensureElement<HTMLSpanElement>('.basket__item-index', this.container);
		this.removeButtonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

		this.removeButtonElement.addEventListener('click', () => {
			events.emit('basket:remove', { id: this.id });
			events.emit('modal:basket:changed');
		});
	}

	render(obj: IBasketCard): HTMLElement {
		super.render(obj);
		this.itemIndexElement.textContent = String(obj.order);
		return this.container;
	}
}

export class OrderView extends BaseComponent<IBasketOrder> {
	protected _payment: 'card' | 'cash';
	protected cardButtonElement: HTMLButtonElement;
	protected cashButtonElement: HTMLButtonElement;
	protected addressElement: HTMLInputElement;
	protected orderButtonElement: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this.cardButtonElement = this.container.elements.namedItem('card') as HTMLInputElement;
		this.cashButtonElement = this.container.elements.namedItem('cash') as HTMLInputElement;
		this.addressElement = this.container.elements.namedItem('address') as HTMLInputElement;
		this.orderButtonElement = ensureElement<HTMLButtonElement>('.order__button', this.container);

		this.cardButtonElement.addEventListener('click', () => this.payment = 'card');
		this.cashButtonElement.addEventListener('click', () => this.payment = 'cash');

		this.addressElement.addEventListener('input', this.updateOrderButtonState.bind(this));

		this.orderButtonElement.addEventListener('click', (evt) => {
			evt.preventDefault();
			events.emit('basketOrder:changed', { address: this.addressElement.value, payment: this.payment });
			events.emit('modal:basketOrder:submit');
		})
	}

	protected set address(address : string) {
		this.addressElement.value = address;
		this.updateOrderButtonState();
	}

	protected set payment(payment : IPay) {
		this._payment = payment ?? 'cash';
		this.updateOrderButtonState();

		if (payment === 'card') {
			this.cardButtonElement.classList.add('button_alt-active');
			this.cashButtonElement.classList.remove('button_alt-active');
			return;
		}

		this.cardButtonElement.classList.remove('button_alt-active');
		this.cashButtonElement.classList.add('button_alt-active');
	}

	protected get payment() {
		return this._payment;
	}

	protected updateOrderButtonState(): void {
		this.orderButtonElement.disabled = !(this.addressElement.value && this.payment);
	}

	render(obj: IBasketOrder): HTMLElement {
		Object.assign(this, obj);
		return this.container;
	}

}

export class ContactsView extends BaseComponent<IBasketContacts> {
	protected emailElement: HTMLInputElement;
	protected phoneElement: HTMLInputElement;
	protected submitButtonElement: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this.emailElement = this.container.elements.namedItem('email') as HTMLInputElement;
		this.phoneElement = this.container.elements.namedItem('phone') as HTMLInputElement;
		this.submitButtonElement = ensureElement<HTMLButtonElement>('.button',  this.container);

		this.emailElement.addEventListener('input', this.updateSubmitButtonState.bind(this));
		this.phoneElement.addEventListener('input', this.updateSubmitButtonState.bind(this));

		this.submitButtonElement.addEventListener('click', (evt) => {
			evt.preventDefault();
			events.emit('basketContacts:changed', { email: this.emailElement.value, phone: this.phoneElement.value });
			events.emit('modal:basketContacts:submit');
		})
	}

	set email(email: string) {
		this.emailElement.value = email;
		this.updateSubmitButtonState();
	}

	set phone(phone: string) {
		this.phoneElement.value = phone;
		this.updateSubmitButtonState();
	}

	updateSubmitButtonState(): void {
		this.submitButtonElement.disabled = !(this.emailElement.value && this.phoneElement.value);
	}


	render(obj: IBasketContacts): HTMLElement {
		Object.assign(this, obj);
		return this.container;
	}
}

/* end views */

