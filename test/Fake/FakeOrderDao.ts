import { IOrderDao } from "../../src/OrderDao";

export class FakeOrderDao implements IOrderDao {
    orders: any = [];

    getOrdersByMarketId(marketId: string): any[] { 
        const orderList = this.orders.filter((order: any) => order.marketId === marketId);        
        return orderList;
    }

    getOrdersByAccountId(accountId: any) {
        const orders = this.orders.filter((order: any) => order.accountId === accountId);
        return orders;
    }

    getOrderById(orderId: any) {
        const order = this.orders.find((order: any) => order.orderId === orderId);
        return order;
    }

    createOrder(order: any) {
        const orderId = crypto.randomUUID();
        order.orderId = orderId;
        order.timestamp = new Date();
        order.status = "Created";
        this.orders.push(order);
        return orderId;
    }
}