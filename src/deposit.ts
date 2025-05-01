import { IAccountDao } from "./AccountDao";

export class Deposit {
    dao: IAccountDao;
    validAssets = ["BTC", "USD"]

    constructor(dao: IAccountDao) {
        this.dao = dao;
    }

    public async execute(deposit: any) {
        if (!this.validAssets.find(s => s === deposit.assetId)) throw new Error("Invalid Asset");
        if (deposit.quantity < 0) throw new Error("Quantity Must Be Greater Than Zero");
        const account = await this.dao.getAccountById(deposit.accountId);
        if (!account) throw new Error("Account Not Found");
        let asset = await this.dao.getAccountBalanceByAsset(deposit.accountId, deposit.assetId);
        if(!asset) return await this.dao.createAsset(deposit);
        asset.quantity += deposit.quantity;
        await this.dao.updateAssetValue(asset);        
    }
}