import { orderScripts, query } from "./database"

export interface IOrderDao {
    getOrdersByAccountId(accountId: any): any
    getOrderById(orderId: any): any
    createOrder(order: any): any
}

export class OrderDao implements IOrderDao {
    async getOrdersByAccountId(accountId: any) {
        return await query(orderScripts.selectOrdersByAccountId, accountId)
            .then((order: any) => {
                return order.map((o: any) => {
                    return {
                        orderId: o.orderId,
                        marketId: o.marketId,
                        accountId: o.accountId,
                        side: o.side,
                        quantity: parseFloat(o.quantity),
                        price: parseFloat(o.price),
                        fillQuantity: parseFloat(o.fillQuantity),
                        fillPrice: parseFloat(o.fillPrice),
                        status: o.status,
                        timestamp: o.timestamp
                    };
                });
            });
    }

    async getOrderById(orderId: any) {
        var [order] = await query(orderScripts.selectOrderById, [orderId])
            .then(order => {
                return order.map((o: any) => {
                    return {
                        orderId: o.orderId,
                        marketId: o.marketId,
                        accountId: o.accountId,
                        side: o.side,
                        quantity: parseFloat(o.quantity),
                        price: parseFloat(o.price),
                        fillQuantity: parseFloat(o.fillQuantity),
                        fillPrice: parseFloat(o.fillPrice),
                        status: o.status,
                        timestamp: o.timestamp
                    };
                });
            });
            
        return order;
    }

    async createOrder(order: any) {
        const orderId = crypto.randomUUID();
        order.orderId = orderId;
        order.timestamp = new Date();
        order.status = "Created";
        await query(orderScripts.insertOrder, [orderId, order.marketId, order.accountId, order.side, order.quantity, order.price, order.status, order.timestamp]);
        return orderId;
    }

}