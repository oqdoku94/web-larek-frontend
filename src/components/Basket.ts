import { BaseComponent } from './base/BaseComponent';
import { IEvents } from './base/events';
import { cloneTemplate, ensureElement } from '../utils/utils';

export class Basket extends BaseComponent<HTMLElement[]> {
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

	setPrice(price: number): Basket {
		this.priceElement.textContent = String(price) + ' синапсов';

		if (price <= 0)
			this.submitButton.disabled = true;

		return this;
	}

	render(obj: HTMLElement[]): HTMLElement {
		this.basketCardListElement.replaceChildren(...obj);
		return this.container;
	}
}