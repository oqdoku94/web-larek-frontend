import './scss/styles.scss';
import { IBasket, IShopApi, ModalCardView, PageCardView, ProductModel } from './types';
import { ShopApi } from './components/ShopApi';
import { EventEmitter, IEvents } from './components/base/events';
import { Store } from './components/Store';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/Modal';

const productCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

const rootElement = ensureElement<HTMLDivElement>('.page');
const modalElement = ensureElement<HTMLDivElement>('#modal-container', rootElement);

const events: IEvents = new EventEmitter();
const store: Store = new Store(events);

const page: Page = new Page(rootElement);
const modal: Modal = new Modal(modalElement, events);

const api: IShopApi = new ShopApi(API_URL);

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
events.on('basket:add', (data: { id: string, price: number }) => {
	console.log('add');
	store.addProductToBasket(data.id, data.price);
	modal.close();
});

events.on('basket:remove', (data: { id: string }) => {
	console.log('remove');
	store.removeProductFromBasket(data.id);
	modal.close();
});