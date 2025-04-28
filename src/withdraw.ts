import express, { Request, Response } from "express";
import { Asset, doTransaction, getAccountBalanceByAsset, getAccountById } from "./account";


const validAssets = ["BTC", "USD"]

export async function withdraw (req: Request, res: Response) {
    const transaction = req.body as Asset
    const account = await getAccountById(transaction.accountId)
    if(account.length <= 0){
    	return res.status(404).json({
            error: "Account Not Found"
        });
    }
    if(!validAssets.find(s => s === transaction.assetId)){
        return res.status(422).json({
            error: "Invalid Asset"
        });
    }
    if(transaction.quantity < 0)
    {
        return res.status(422).json({
            error: "Invalid Quantity"
        });
    }
    const asset = await getAccountBalanceByAsset(transaction.accountId, transaction.assetId);
    if(!asset || asset?.quantity < transaction.quantity){
        return res.status(422).json({
            error: "Balance unavailable"
        });
    }
    await doTransaction(transaction, false)
    res.json()
}
