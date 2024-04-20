import { BaseComponent } from './base/BaseComponent';
import { IEvents } from './base/events';
import { cloneTemplate, ensureElement } from '../utils/utils';
import { ICard, ICardAction } from '../types';
import { CDN_URL } from '../utils/constants';

export class Card extends BaseComponent<ICard> {
	protected id: string;
	protected readonly categoryElement: HTMLSpanElement;
	protected readonly titleElement: HTMLHeadingElement;
	protected readonly imageElement: HTMLImageElement;
	protected readonly priceElement: HTMLSpanElement;
	protected descriptionElement: HTMLParagraphElement;
	protected buttonElement: HTMLButtonElement;
	protected itemIndexElement: HTMLSpanElement;


	constructor(protected template: HTMLTemplateElement, protected events: IEvents, action?: ICardAction) {

		super(cloneTemplate(template), events);

		this.categoryElement = this.container.querySelector('.card__category');
		this.titleElement = ensureElement<HTMLHeadingElement>('.card__title', this.container);
		this.imageElement = this.container.querySelector('.card__image');
		this.priceElement = ensureElement<HTMLSpanElement>('.card__price', this.container);
		this.descriptionElement = this.container.querySelector('.card__text');
		this.buttonElement = this.container.querySelector('.card__button');
		this.itemIndexElement = this.container.querySelector('.basket__item-index');

		if (action?.onClick) {
			if (this.buttonElement) {
				this.buttonElement.addEventListener('click', action.onClick);
			} else {
				this.container.addEventListener('click', action.onClick);
			}
		}
	}

	set category(category: string) {
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
			default:
				this.categoryElement.classList.add('card__category_other');
				break;
		}
	}

	set title(title: string) {
		this.titleElement.textContent = title;
	}

	set image(src: string) {
		this.imageElement.src = CDN_URL + src;
	}

	set price(price: number) {
		this.priceElement.textContent = price && price > 0 ? `${price} синапсов` : 'Бесценно';
	}

	set description(description: string) {
		this.descriptionElement.textContent = description;
	}

	set isInBasket(state: boolean) {
		this.buttonElement.textContent = state ? 'Удалить' : 'Добавить';
	}

	set index(index: number) {
		this.itemIndexElement.textContent = String(index);
	}
}