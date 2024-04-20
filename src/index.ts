import './scss/styles.scss';
import {
	IBasketContacts,
	IBasketOrder,
	IProduct,
	IShopApi,
} from './types';
import { ShopApi } from './components/ShopApi';
import { EventEmitter } from './components/base/events';
import { Storage } from './components/Storage';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/Modal';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';

const rootElement = ensureElement<HTMLDivElement>('.page');
const events = new EventEmitter();
const page: Page = new Page(rootElement, events);

const productCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog', rootElement);
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview', rootElement);
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket', rootElement);
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket', rootElement);
const basketOrderTemplate = ensureElement<HTMLTemplateElement>('#order', rootElement);
const basketContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts', rootElement);
const successTemplate = ensureElement<HTMLTemplateElement>('#success', rootElement);

const modalElement = ensureElement<HTMLDivElement>('#modal-container', rootElement);
const basketElement = new Basket(basketTemplate, events);
const orderElement = new Order(cloneTemplate(basketOrderTemplate), events);
const contactsElement = new Contacts(cloneTemplate(basketContactsTemplate), events);
const successElement = new Success(successTemplate, events);

const storage: Storage = new Storage(events);
const api: IShopApi = new ShopApi(API_URL);
const modal: Modal = new Modal(modalElement, events);

api.getAllProducts().then(data => {
	storage.products = data;
});

function renderCards(products: IProduct[]) {
	page.productCards = products.map(product => new Card(productCardTemplate, events, {
		onClick: () => events.emit('preview:selected', product),
	}).render({
		id: product.id,
		category: product.category,
		title: product.title,
		image: product.image,
		price: product.price,
	}));
}

function renderPreview(product: IProduct) {
	modal.render(new Card(previewCardTemplate, events, {
		onClick: () => events.emit('preview:submit', product),
	})
		.render({
			id: product.id,
			category: product.category,
			title: product.title,
			image: product.image,
			price: product.price,
			description: product.description,
			isInBasket: storage.isInBasket(product.id),
		}));
}

function renderBasket() {
	modal.render(basketElement
		.render({
			price: storage.getBasketTotalPrice(),
			cards: storage.getProductsInBasket()
				.map((product: IProduct, index: number) => new Card(basketCardTemplate, events, {
					onClick: () => events.emit('basket:remove', product),
				})
					.render({
						id: product.id,
						title: product.title,
						price: product.price,
						index: index + 1,
					})),
		}));
}

events.on('modal:close', page.unlock.bind(page));

events.on('modal:open', page.lock.bind(page));

events.on('products:changed', (products: IProduct[]) => {
	renderCards(products);
});

events.on('preview:selected', (product: IProduct) => {
	renderPreview(product);
	modal.open();
});

events.on('preview:submit', (product: IProduct) => {
	if (storage.isInBasket(product.id)) {
		storage.removeProductFromBasket(product.id);
		renderPreview(product);
	} else {
		storage.addProductToBasket(product);
		renderPreview(product);
	}
});

events.on('basket:changed', (basket: string[]) => page.basketCounter = basket.length);

events.on('basket:open', () => {
	renderBasket();
	modal.open();
});

events.on('basket:remove', (product: IProduct) => {
	storage.removeProductFromBasket(product.id);
	renderBasket();
});

events.on('basket:submit', () => {
	storage.clearOrder();
	modal.render(orderElement.render(storage.order));
});

events.on('order:submit', (data: IBasketOrder) => {
	storage.order = data;
	storage.clearContacts();
	modal.render(contactsElement.render(storage.contacts));
});

events.on('contacts:submit', (data: IBasketContacts) => {
	storage.contacts = data;
	api.addOrder(storage.getCurrentOrder()).then(result => {
		storage.clearOrder();
		storage.clearContacts();
		storage.clearBasket();
		modal.render(successElement.render(result));
	}).catch(e => console.error(e));
});

events.on('success:submit', modal.close.bind(modal));