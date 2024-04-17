import './scss/styles.scss';
import {
	BasketView, ContactsView,
	IBasket,
	IBasketOrder, IOrder,
	IShopApi,
	ModalCardView,
	OrderView,
	PageCardView,
	ProductModel,
} from './types';
import { ShopApi } from './components/ShopApi';
import { EventEmitter, IEvents } from './components/base/events';
import { Storage } from './components/Storage';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/Modal';

const rootElement = ensureElement<HTMLDivElement>('.page');
const events: IEvents = new EventEmitter();
const page: Page = new Page(rootElement, events);

const productCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog', rootElement);
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview', rootElement);
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket', rootElement);
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket', rootElement);
const basketOrderTemplate = ensureElement<HTMLTemplateElement>('#order', rootElement);
const basketContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts', rootElement);

const modalElement = ensureElement<HTMLDivElement>('#modal-container', rootElement);


const store: Storage = new Storage(events);
const api: IShopApi = new ShopApi(API_URL);
const modal: Modal = new Modal(modalElement, events);

api.getAllProducts().then(data => {
	store.products = data.map(product => new ProductModel(product, events));
	renderCards();
});


function renderCards() {
	page.productCards = store.products
		.map(product => new PageCardView(cloneTemplate(productCardTemplate), events)
			.render({
				category: product.category,
				id: product.id,
				image: product.image,
				priceText: product.priceText,
				title: product.title,
			}));
}

function renderBasket() {
	return new BasketView(cloneTemplate(basketTemplate), events, basketCardTemplate).render({
		items: Array.from(store.basket.items.keys()).map(item => store.getProductById(item)).map((product, index) => {
			return {
				id: product.id,
				title: product.title,
				priceText: product.priceText,
				order: ++index,
			};
		}),
		total: store.basket.total,
	});
}

events.on('product:changed', renderCards);
events.on('product:selected', (data: { id: string }) => {
	api.getProductById(data.id).then(product => {
		const newProductModel = new ProductModel(product, events);
		store.products = [...store.products.filter(product => product.id !== data.id), newProductModel];
		modal.render(new ModalCardView(cloneTemplate(previewCardTemplate), events).render({
			category: newProductModel.category,
			id: newProductModel.id,
			image: newProductModel.image,
			priceText: newProductModel.priceText,
			title: newProductModel.title,
			description: newProductModel.description,
			price: newProductModel.price ?? 0,
			isInBasket: store.isInBasket(newProductModel.id),
		}));
		modal.open();
	});
});

events.on('modal:close', page.unlock.bind(page));
events.on('modal:open', page.lock.bind(page));

events.on('basket:changed', (basket: IBasket) => page.basketCounter = basket.items.size);
events.on('basket:add', (data: { id: string }) => {
	console.log('basket:add');
	const product = store.getProductById(data.id);
	store.addProductToBasket(product.id, product.price);
});

events.on('basket:remove', (data: { id: string }) => {
	console.log('basket:remove');
	store.removeProductFromBasket(data.id);
});

events.on('basket:open', () => {
	console.log('basket:open');
	modal.render(renderBasket());
	modal.open();
});

events.on('modal:basket:changed', () => {
	console.log('modal:basket:changed');
	modal.render(renderBasket());
});

events.on('modal:basket:submit', () => {
	store.clearBasketOrder();
	const basketOrderView = new OrderView(cloneTemplate(basketOrderTemplate), events);
	modal.render(basketOrderView.render(store.basketOrder));
});

events.on('modal:basketOrder:submit', () => {
	console.log('modal:basketOrder:submit');
	store.clearBasketContacts();
	const basketContactsView = new ContactsView(cloneTemplate(basketContactsTemplate), events);
	modal.render(basketContactsView.render(store.basketContacts));
});

events.on('modal:basketContacts:submit', () => {
	console.log('modal:basketContacts:submit');
	const order: IOrder = {
		address: store.basketOrder.address,
		email: store.basketContacts.email,
		items: Array.from(store.basket.items).filter(keyValuePair => keyValuePair[1]).map(keyValuePair => keyValuePair[0]),
		payment: store.basketOrder.payment,
		phone: store.basketContacts.phone,
		total: store.basket.total,
	};
	console.log(order);
	api.addOrder(order).then(data => {
		console.log(`Создан заказ '${data.id}' на сумму '${data.total}'.`);
		store.clearBasket();
		store.clearBasketOrder();
		store.clearBasketContacts();

		modal.close();
	})
		.catch(err => console.log(err));
})
	;;