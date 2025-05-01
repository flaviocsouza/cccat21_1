import express, {Request, Response } from "express";
import { placeOrder } from "./placeOrder";
import { Signup } from "./signup";
import { GetAccount } from "./GetAccount";
import { AccountDao } from "./AccountDao";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";

const app = express();
app.use(express.json());

const signup = new Signup(new AccountDao());
const getAccount = new GetAccount(new AccountDao());
const deposit = new Deposit(new AccountDao());
const withdraw = new Withdraw(new AccountDao());

app.post("/placeOrder", placeOrder)

app.post("/deposit", async(req: Request, res: Response) => {
    try{
        const response = await deposit.execute(req.body);
        res.json(response);
    }
    catch(e)
    {
        res.status(422).json(e);
    }
});

app.post("/withdraw", async(req: Request, res: Response) => {
    try{
        const response = await withdraw.execute(req.body);
        res.json(response);
    }
    catch(e)
    {
        res.status(422).json(e);
    }
});

app.post("/signup", async (req: Request, res: Response) => {
    try{
        const response = await signup.execute(req.body);
        res.json(response);
    }
    catch(e)
    {
        res.status(422).json(e);
    }
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const response = await getAccount.execute(req.params.accountId);
    res.json(response);
});

app.listen(3000);