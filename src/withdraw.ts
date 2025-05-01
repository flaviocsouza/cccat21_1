import { AccountDao, IAccountDao } from "./AccountDao";

export class Withdraw {
    private dao: IAccountDao
    validAssets = ["BTC", "USD"]

    constructor(dao: IAccountDao) {
        this.dao = dao;
    }

    public async execute(withdraw: any) {
        const account = await this.dao.getAccountById(withdraw.accountId)
        if (!account) throw { error: "Account Not Found" };
        if (!this.validAssets.find(s => s === withdraw.assetId)) throw { error: "Invalid Asset" };
        if (withdraw.quantity < 0) throw { error: "Invalid Quantity" };
        const asset = await this.dao.getAccountBalanceByAsset(withdraw.accountId, withdraw.assetId);
        if (!asset || asset?.quantity < withdraw.quantity) throw { error: "Balance unavailable" };
        asset.quantity -= withdraw.quantity;
        await this.dao.updateAssetValue(asset);
    }
}