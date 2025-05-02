import { IOrderDao } from "../../src/OrderDao";

export class FakeOrderDao implements IOrderDao{
    getOrdersByMarketId(marketId: string) : any[] {
        return [];
    }
    
    orders: any = [];

    getOrdersByAccountId(accountId: any) {
        const order = this.orders.filter((order: any) => order.accountId === accountId);
        return order;
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