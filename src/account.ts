import crypto from "crypto";
import { accountScripts, connection } from "./database";

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
    await connection.query(accountScripts.insertAccountScript, [account.accountId, account.name, account.email, account.document, account.password]);
    return accountId;
}

export async function getAccountById(accountId:any) {
    return await connection.query(accountScripts.selectAccountScript, accountId);
}

export async function getAccountBalance(accountId:any): Promise<Asset[]> {
    return await connection.query<Asset[]>(accountScripts.selectAccountAssetsScript, accountId)
    .then(assets => {
        return assets.map( a => {
            return { 
                accountId: a.accountId, 
                assetId: a.assetId, 
                quantity: Number(a.quantity)};
        }) 
    });
    
}

export async function getAccountBalanceByAsset(accountId:any, assetId: any): Promise<Asset | null> {
    return await connection.query<Asset[]>(accountScripts.selectAccountAssetByIdScript, [accountId, assetId])
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
    return await connection.query(accountScripts.updtateExistingAssetScript, [asset!.quantity, asset!.accountId, asset!.assetId]);
}

export async function transactNewAsset(transaction:any)
{
    return await connection.query(accountScripts.insertNewAssetScript, [transaction.accountId, transaction.assetId, transaction.quantity]);
}