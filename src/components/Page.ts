import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export class Page {
	protected _productCards: HTMLDivElement;
	protected _pageWrapper: HTMLDivElement;
	protected _basketButton: HTMLButtonElement;
	protected _basketCounter: HTMLSpanElement;

	constructor(protected rootElement: HTMLElement, protected events: IEvents) {
		this._productCards = ensureElement<HTMLDivElement>('.gallery', this.rootElement);
		this._pageWrapper = ensureElement<HTMLDivElement>('.page__wrapper', this.rootElement);
		this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.rootElement);
		this._basketCounter = ensureElement<HTMLSpanElement>('.header__basket-counter', this.rootElement);

		this._basketButton.addEventListener('click', () => { events.emit('basket:open')});
	}

	set productCards(elements : HTMLElement[]) {
		this._productCards.replaceChildren(...elements);
	}

	set basketCounter(count: number) {
		this._basketCounter.textContent = String(count);
	}

	lock() {
		this._pageWrapper.classList.add('page__wrapper_locked');
	}

	unlock() {
		this._pageWrapper.classList.remove('page__wrapper_locked');
	}
}