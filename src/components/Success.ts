import { BaseComponent } from './base/BaseComponent';
import { IEvents } from './base/events';
import { cloneTemplate, ensureElement } from '../utils/utils';
import { ISuccessOrder } from '../types';

export class Success extends BaseComponent<ISuccessOrder> {
	protected titleElement: HTMLHeadingElement;
	protected descriptionElement: HTMLParagraphElement;
	protected buttonElement: HTMLButtonElement;

	constructor(protected template: HTMLTemplateElement, protected events: IEvents) {
		super(cloneTemplate(template), events);

		this.titleElement = ensureElement<HTMLHeadingElement>('.order-success__title', this.container);
		this.descriptionElement = ensureElement<HTMLParagraphElement>('.order-success__description', this.container);
		this.buttonElement = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

		this.buttonElement.addEventListener('click', () => events.emit('success:submit'));
	}

	set total(total: number) {
		this.descriptionElement.textContent = `Списано ${String(total)} синапсов`;
	}
}