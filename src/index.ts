import express from "express";
import { placeOrder } from "./placeOrder";
import { deposit } from "./deposit";
import { withdraw } from "./withdraw";
import { getAccount, signup } from "./signup";

const app = express();
app.use(express.json());

app.post("/placeOrder", placeOrder)
app.post("/deposit", deposit)
app.post("/withdraw", withdraw)
app.post("/signup", signup)
app.get("/accounts/:accountId", getAccount);

app.listen(3000);