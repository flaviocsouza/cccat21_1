import { IOrderDao } from "./OrderDao";

export class GetOrderById {
    orderDao: IOrderDao

    constructor(orderDao: IOrderDao) {
        this.orderDao = orderDao;
    }

    public async execute(orderId: any) {
        const order = await this.orderDao.getOrderById(orderId);
        return { order }
    }
}