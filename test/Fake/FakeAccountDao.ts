import { AccountDao } from "../../src/AccountDao";

export class FakeAccountDao implements AccountDao {

    accounts: any = [];
    assets: any = [];

    async createAccount(account: any): Promise<any> {
        const accountId = crypto.randomUUID();
        account.accountId = accountId;
        this.accounts.push(account);
        return accountId;
    }

    async getAccountById(accountId: string): Promise<any> {
        const account = this.accounts.find((account: any) => account.accountId === accountId);
        return account;
    }

    async getAccountAssets(accountId: string): Promise<any> {        
        return this.assets.filter((asset:any) => asset.accountId === accountId);
    }

    getAccountBalanceByAsset(accountId: any, assetId: any): any | null {
        return this.assets.find((a:any) => a.assetId === assetId && a.accountId === accountId);
    }

    createAsset(transaction: any): any {
        this.assets.push(transaction);
    }

    updateAssetValue(transaction: any): any {
        let asset = this.assets.find((a:any) => a.assetId === transaction.assetId && a.accountId === transaction.accountId);
        if(!!asset) asset.quantity = transaction.quantity;
    }
}