
import pgp from "pg-promise";
import crypto, { randomUUID } from "crypto";

const connection = pgp({
    receive(e) {
        camelizeColumns(e.data);
    }
})("postgres://postgres:123456@localhost:5432/app");


function camelizeColumns(data:any) {
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

export interface Asset
{
    accountId: string;
    assetId: string;
    quantity: number;
}

export async function createAccount(account:any)
{
    const accountId = crypto.randomUUID();
    account.accountId = accountId;    
    await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.document, account.password]);
    return accountId;
}

export async function getAccountById(accountId:any) {
    return await connection.query("select * from ccca.account where account_id = $1", accountId);
}

export async function getAccountBalance(accountId:any): Promise<Asset[]> {
    return await connection.query<Asset[]>("select * from ccca.account_asset where account_id = $1", accountId)
    .then(assets => {
        return assets.map( a=> {
            return { 
                accountId: a.accountId, 
                assetId: a.assetId, 
                quantity: Number(a.quantity)};
        }) 
    });
    
}

export async function getAccountBalanceByAsset(accountId:any, assetId: any): Promise<Asset | null> {
    return await connection.query<Asset[]>("select * from ccca.account_asset where account_id = $1 and asset_id = $2", [accountId, assetId])
    .then(assets => {
        return assets.map( a => {
            return { 
                accountId: a.accountId, 
                assetId: a.assetId, 
                quantity: Number(a.quantity)};
        }) 
    }).then(assets => {
        return assets[0];
    });
}

export async function doTransaction(transaction:Asset, positiveTransaction:boolean = true) {    
    if(!positiveTransaction) transaction.quantity *= -1;
    const currentBalance = await getAccountBalanceByAsset(transaction.accountId, transaction.assetId);        
    if(currentBalance)
       return await transactExistingAsset(transaction);

    return await transactNewAsset(transaction);
}

export async function transactExistingAsset(transaction:Asset) {
    var asset = await getAccountBalanceByAsset(transaction.accountId, transaction.assetId);  
    asset!.quantity += transaction.quantity;
    return await connection.query("update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3", [asset!.quantity, asset!.accountId, asset!.assetId]);
}

export async function transactNewAsset(transaction:any)
{
    return await connection.query("insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)", [transaction.accountId, transaction.assetId, transaction.quantity]);
}