import { Api, ApiListResponse } from './base/api';
import { IOrder, IProduct, IShopApi, ISuccessOrder } from '../types';

export class ShopApi extends Api implements IShopApi {

	async addOrder(order: IOrder): Promise<ISuccessOrder> {
		return this.post('/order', order);
	}

	async getAllProducts(): Promise<IProduct[]> {
		const apiList = await this.get<ApiListResponse<IProduct>>('/product/');

		return apiList.items;
	}

	async getProductById(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`);
	}
}