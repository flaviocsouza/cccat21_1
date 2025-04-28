import express, { Request, Response } from "express";
import { doTransaction, getAccountById } from "./account";

const app = express();
app.use(express.json());

const validAssets = ["BTC", "USD"]

app.post("/deposit", async (req: Request, res: Response) => {
    const deposit = req.body;
    if(!validAssets.find(s => s === deposit.assetId)){
        return res.status(422).json({
            error : "Invalid Asset"
        });
    }
    if(deposit.quantity < 0){
        return res.status(422).json({
            error : "Quantity Must Be Greater Than Zero"
        });
    }
    const account = await getAccountById(deposit.accountId)        
    if(account.length <= 0){
        return res.status(422).json({ 
            error : "Account Not Found"
        });
    }
    const transaction = {
        accountId : deposit.accountId,
        quantity : deposit.quantity,
        assetId : deposit.assetId
    }
    await doTransaction(transaction);    
    res.json();
});

app.listen(3000);