import { BaseComponent } from './base/BaseComponent';
import { IEvents } from './base/events';
import { cloneTemplate, ensureElement } from '../utils/utils';
import { IBasket } from '../types';

export class Basket extends BaseComponent<IBasket> {
	protected basketCardListElement: HTMLUListElement;
	protected submitButton: HTMLButtonElement;
	protected priceElement: HTMLSpanElement;

	constructor(protected template: HTMLTemplateElement, protected events: IEvents) {
		super(cloneTemplate(template), events);

		this.basketCardListElement = ensureElement<HTMLUListElement>('.basket__list', this.container);
		this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
		this.priceElement = ensureElement<HTMLSpanElement>('.basket__price', this.container);

		this.submitButton.addEventListener('click', () => events.emit('basket:submit'));
	}

	set price(price: number) {
		this.priceElement.textContent = String(price) + ' синапсов';
		this.submitButton.disabled = price <= 0;
	}

	set cards(elements: HTMLElement[]) {
		this.basketCardListElement.replaceChildren(...elements);
	}
}