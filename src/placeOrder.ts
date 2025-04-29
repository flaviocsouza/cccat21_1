import { Request, Response } from "express";
import { getAccountBalanceByAsset, getAccountById } from "./account";
import { createOrder, getOrdersByAccountId, Order } from "./order";


const sides = {
    buy: "BUY",
    sell: "SELL"
}

export async function placeOrder(req: Request, res: Response) {
    const order = req.body as Order;
    const account = await getAccountById(order.accountId);
    if (account.length <= 0) {
        return res.status(404).json({
            error: "Account Not Found"
        });
    }
    const withdrawnAssetId = getWithdrawnAsset(order);
    const currentOrders = await getOrdersByAccountId(order.accountId);
    const lockedBalance = currentOrders
        .filter(checkedOrder => getOrdersWithdrawingAsset(withdrawnAssetId, checkedOrder))
        .reduce((sum, curr) => sum + curr.quantity, order.quantity);

    const withdrawnAsset = await getAccountBalanceByAsset(order.accountId, withdrawnAssetId);
    if (!withdrawnAsset || withdrawnAsset?.quantity < lockedBalance) {
        return res.status(422).json({
            error: "Balance unavailable"
        });
    };

    const orderId = await createOrder(order);
    res.json({ orderId });
}

function getWithdrawnAssetPosition(side: string): number {
    return side === sides.sell ? 0 : 1;
}

function getAssetsByMarket(marketId: string): string[] {
    return marketId.split("/")
}

function getWithdrawnAsset(order: Order): string {
    const withdrawnAssetPosition = getWithdrawnAssetPosition(order.side);
    return getAssetsByMarket(order.marketId)[withdrawnAssetPosition];
}

function getOrdersWithdrawingAsset(assetId: string, order: Order) {
    const assetToCheck = order.side === sides.buy
        ? getSideAssetByMarket(order.marketId)
        : getMainAssetByMarket(order.marketId);
    return assetToCheck === assetId;

}

function getMainAssetByMarket(marketId: string): string {
    return getAssetsByMarket(marketId)[0]
}

function getSideAssetByMarket(marketId: string): string {
    return getAssetsByMarket(marketId)[1]
}