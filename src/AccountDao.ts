export interface IAccountDao {
    getAccountById(accountId: string): any
    getAccountAssets(accountId: any): any | null
    getAccountBalanceByAsset(accountId: any, assetId: any): any | null
    createAccount(account: any): any
    createAsset(transaction: any): any
    updateAssetValue(transaction: any): any
}


import { accountScripts, query } from "./database";

export class AccountDao implements IAccountDao {

    async createAccount(account: any): Promise<any> {
        const accountId = crypto.randomUUID();
        account.accountId = accountId;
        await query(accountScripts.insertAccountScript, [account.accountId, account.name, account.email, account.document, account.password]);
        return accountId;
    }

    async getAccountById(accountId: string) {
        var [account] = await query(accountScripts.selectAccountScript, [accountId]);
        return account;
    }

    async getAccountAssets(accountId: any): Promise<any | null> {
        return await query(accountScripts.selectAccountAssetsScript, [accountId])
            .then(assets => {
                return assets.map((a: any) => {
                    return {
                        accountId: a.accountId,
                        assetId: a.assetId,
                        quantity: parseFloat(a.quantity)
                    };
                })
            });
    }
    async getAccountBalanceByAsset(accountId: any, assetId: any): Promise<any | null> {
        return await query(accountScripts.selectAccountAssetByIdScript, [accountId, assetId])
            .then(assets => {
                return assets.map((a: any) => {
                    return {
                        accountId: a.accountId,
                        assetId: a.assetId,
                        quantity: parseFloat(a.quantity)
                    };
                })
            }).then(assets => {
                return assets[0];
            });
    }

    async createAsset(transaction: any) {
        return await query(accountScripts.insertNewAssetScript, [transaction.accountId, transaction.assetId, transaction.quantity]);
    }

    async updateAssetValue(asset: any) {
        return await query(accountScripts.updtateExistingAssetScript, [asset!.quantity, asset!.accountId, asset!.assetId]);
    }
}