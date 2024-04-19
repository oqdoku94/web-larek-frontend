import { IEvents } from './events';

export abstract class BaseComponent<T> {
	protected constructor(protected container: HTMLElement, protected events: IEvents) {
	}

	render(obj: Partial<T>): HTMLElement {
		Object.assign(this, obj);
		return this.container;
	}
}