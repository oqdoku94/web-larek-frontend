import { BaseComponent } from './base/BaseComponent';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';
import { IBasketContacts } from '../types';

export class Contacts extends BaseComponent<IBasketContacts> {
	protected emailElement: HTMLInputElement;
	protected phoneElement: HTMLInputElement;
	protected submitButtonElement: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this.emailElement = this.container.elements.namedItem('email') as HTMLInputElement;
		this.phoneElement = this.container.elements.namedItem('phone') as HTMLInputElement;
		this.submitButtonElement = ensureElement<HTMLButtonElement>('.button', this.container);

		this.emailElement.addEventListener('input', this.updateSubmitButtonState.bind(this));
		this.phoneElement.addEventListener('input', this.updateSubmitButtonState.bind(this));

		this.submitButtonElement.addEventListener('click', (evt) => {
			evt.preventDefault();
			events.emit('contacts:submit', { email: this.emailElement.value, phone: this.phoneElement.value });
		});
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
}