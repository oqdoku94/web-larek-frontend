import { IEvents } from './events';

export abstract class BaseModel<T> {
	constructor(obj: T, protected events: IEvents) {
		Object.assign(this, obj);
	}
}