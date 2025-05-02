import { IOrderDao } from "./OrderDao";

export class GetDepth {
    private orderDao: IOrderDao
    private validAssets = ["BTC", "USD"]

    constructor(orderDao: IOrderDao) {
        this.orderDao = orderDao;
    }

    public async execute(depth: any): Promise<any> {
        const assets = this.getAssets(depth.marketId);
        if (!this.isAssetsValid(assets)) throw new Error("Invalid Asset");
        if (depth.precision < 0) throw new Error("Invalid Precision");
        const orders = await this.orderDao.getOrdersByMarketId(depth.marketId);
        const buys = this.mergeOrderByPrecision(orders.filter((o: any) => o.side === "BUY"), depth.precision);
        const sells = this.mergeOrderByPrecision(orders.filter((o: any) => o.side === "SELL"), depth.precision);
        return { buys, sells }
    }

    private getAssets(marketId: string) {
        const assetList = marketId.split("/");
        return { mainAsset: assetList[0], sideAsset: assetList[1] };
    }

    private isAssetsValid(assets: any) {
        return this.validAssets.some(a => a == assets.mainAsset) && this.validAssets.some(a => a == assets.sideAsset);
    }

    private mergeOrderByPrecision(orders: any[], precision: number = 0) {
        const returnList: any[] = [];
        orders.forEach(order => {
            const valuedOrder = returnList.find((o: any) => this.getRelevantValue(o.price, precision) === this.getRelevantValue(order.price, precision))
            if (!valuedOrder) {
                returnList.push({
                    price: this.getValuedPriceOrder(order.price, precision),
                    quantity: order.quantity,
                    marketId: order.marketId,
                    side: order.side,
                    mergedOrders: [order]
                });
                return;
            }
            valuedOrder.quantity += order.quantity;
            valuedOrder.mergedOrders.push(order);
        });
        return returnList;
    }

    private getRelevantValue(value: number, precision: number): string {
        const stringValue = `${value}`;
        return stringValue.substring(0, stringValue.length - precision);
    }

    private getValuedPriceOrder(price: number, precision: number): number {
        const relevantPrice = this.getRelevantValue(price, precision);
        return parseFloat(relevantPrice) * (10 ** precision)
    }
}