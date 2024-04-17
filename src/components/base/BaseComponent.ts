import { IEvents } from './events';
import { IView } from '../../types';

export abstract class BaseComponent<T> implements IView<T>{
	protected constructor(protected container: HTMLElement, protected events: IEvents) { }

	abstract render(obj: T): HTMLElement;
}