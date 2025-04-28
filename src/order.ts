import crypto from "crypto";
import { connection, orderScripts } from "./database";

export interface Order {
    orderId: string;
    marketId: string;
    accountId: string;
    side: string;
    quantity: number;
    price: number;
    fillQuantity: number;
    fillPrice: number;
    status: string;
    timestamp: Date;
}

export async function createOrder(order: Order) {
    const orderId = crypto.randomUUID();
    order.orderId = orderId;
    order.timestamp = new Date();
    await connection.query(orderScripts.insertOrder, [orderId, order.marketId, order.accountId, order.side, order.quantity, order.price, order.fillQuantity, order.fillPrice, order.status, order.timestamp]);
    return orderId;
}

export async function getOrderById(orderId: string): Promise<Order | null> {    
    return await connection.query<Order[]>(orderScripts.selectOrderById, orderId)
        .then(order => {
            return order.map(o => {
                return {
                    orderId: o.orderId,
                    marketId: o.marketId,
                    accountId: o.accountId,
                    side: o.side,
                    quantity: Number(o.quantity),
                    price: Number(o.price),
                    fillQuantity: Number(o.fillQuantity),
                    fillPrice: Number(o.fillPrice),
                    status: o.status,
                    timestamp: o.timestamp
                };
            });
        }).then(orders => {
            return orders[0];
        });
}


export async function getOrdersByAccountId(accountId: string): Promise<Order[]> {   
    return await connection.query<Order[]>(orderScripts.selectOrdersByAccountId, accountId)
        .then(order => {
            return order.map(o => {
                return {
                    orderId: o.orderId,
                    marketId: o.marketId,
                    accountId: o.accountId,
                    side: o.side,
                    quantity: Number(o.quantity),
                    price: Number(o.price),
                    fillQuantity: Number(o.fillQuantity),
                    fillPrice: Number(o.fillPrice),
                    status: o.status,
                    timestamp: o.timestamp
                };
            });
        });
}
