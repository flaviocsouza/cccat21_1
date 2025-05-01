import express, {Request, Response } from "express";
import { Signup } from "./Signup";
import { GetAccount } from "./GetAccount";
import { AccountDao } from "./AccountDao";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";
import { PlaceOrder } from "./PlaceOrder";
import { OrderDao } from "./OrderDao";
import { GetOrderById } from "./GetOrderById";

const app = express();
app.use(express.json());

const signup = new Signup(new AccountDao());
const getAccount = new GetAccount(new AccountDao());
const deposit = new Deposit(new AccountDao());
const withdraw = new Withdraw(new AccountDao());
const placeOrder = new PlaceOrder(new OrderDao(), new AccountDao());
const getOrderById = new GetOrderById(new OrderDao());

app.post("/placeOrder", async(req: Request, res: Response) => {
    try{
        const response = await placeOrder.execute(req.body);
        res.json(response);
    }
    catch(e)
    {
        res.status(422).json(e);
    }
});

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

app.get("/order/:orderId", async (req: Request, res: Response) => {
    const response = await getOrderById.execute(req.params.orderId);
    res.json(response);
});

app.listen(3000);