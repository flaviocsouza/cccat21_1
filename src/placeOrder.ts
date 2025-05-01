import { IAccountDao } from "./AccountDao";
import { IOrderDao } from "./OrderDao"

export class PlaceOrder {
    private orderDao: IOrderDao;
    private accountDao: IAccountDao;
    private sides = {
        buy: "BUY",
        sell: "SELL"
    }

    constructor(orderDao: IOrderDao, accountDao: IAccountDao) {
        this.orderDao = orderDao;
        this.accountDao = accountDao;
    }

    public async execute(order: any) {
        const account = await this.accountDao.getAccountById(order.accountId);
            if (!account) throw { error: "Account Not Found" };
            const withdrawnAssetId = this.getWithdrawnAsset(order);
            const currentOrders = await this.orderDao.getOrdersByAccountId(order.accountId);
            const lockedBalance = currentOrders
                .filter((checkedOrder: any) => this.getOrdersWithdrawingAsset(withdrawnAssetId, checkedOrder))
                .reduce((sum: number, curr:  any) => sum + curr.quantity, order.quantity);        
            const withdrawnAsset = await this.accountDao.getAccountBalanceByAsset(order.accountId, withdrawnAssetId);
            if (!withdrawnAsset || withdrawnAsset?.quantity < lockedBalance) throw { error: "Balance unavailable" };
            const orderId = await this.orderDao.createOrder(order);
            return { orderId }
    }

    private getWithdrawnAsset(order: any): string {
        const withdrawnAssetPosition = this.getWithdrawnAssetPosition(order.side);
        return this.getAssetsByMarket(order.marketId)[withdrawnAssetPosition];
    }

    private getWithdrawnAssetPosition(side: string): number {
        return side === this.sides.sell ? 0 : 1;
    }
    
    private getAssetsByMarket(marketId: string): string[] {
        return marketId.split("/")
    }

    private getOrdersWithdrawingAsset(assetId: string, order: any) {
        const assetToCheck = order.side === this.sides.buy
            ? this.getSideAssetByMarket(order.marketId)
            : this.getMainAssetByMarket(order.marketId);
        return assetToCheck === assetId;
    
    }

    private getMainAssetByMarket(marketId: string): string {
        return this.getAssetsByMarket(marketId)[0]
    }
    
    private getSideAssetByMarket(marketId: string): string {
        return this.getAssetsByMarket(marketId)[1]
    }
}