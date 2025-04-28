
import pgp from "pg-promise";
import crypto, { randomUUID } from "crypto";

const connection = pgp({
    receive(e) {
        camelizeColumns(e.data);
    }
})("postgres://postgres:123456@localhost:5432/app");

function camelizeColumns(data: any) {
    const tmp = data[0];
    for (const prop in tmp) {
        const camel = pgp.utils.camelize(prop);
        if (!(camel in tmp)) {
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                d[camel] = d[prop];
                delete d[prop];
            }
        }
    }
}

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
    await connection.query("insert into ccca.order(order_id, market_id, account_id,	side, quantity,	price, fill_quantity, fill_price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [orderId, order.marketId, order.accountId, order.side, order.quantity, order.price, order.fillQuantity, order.fillPrice, order.status, order.timestamp]);
    return orderId;
}

export async function getOrderById(orderId: string): Promise<Order | null> {    
    return await connection.query<Order[]>("select * from ccca.order where order_id = $1", orderId)
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
    return await connection.query<Order[]>("select * from ccca.order where account_id = $1", accountId)
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
