import express, { Request, Response } from "express";
import { getAccountBalanceByAsset, getAccountById } from "./account";
import { createOrder, getOrdersByAccountId, Order } from "./orders";

const app = express();
app.use(express.json());

app.post("/placeOrder", async (req: Request, res: Response) => {
    const order = req.body as Order;
    const account = await getAccountById(order.accountId);
    if (account.length <= 0) {
        return res.status(404).json({
            error: "Account Not Found"
        });
    }
    const withdrawnAssetPosition = order.side == "SELL" ? 0 : 1;
    const withdrawnAssetId = order.marketId.split("/")[withdrawnAssetPosition];
    const withdrawnAsset = await getAccountBalanceByAsset(order.accountId, withdrawnAssetId);
    const currentOrders = await getOrdersByAccountId(order.accountId);

    var buyingOrdersValue = 0;
    const buyingPricesOrders = currentOrders
        .filter(o => o.side === "BUY" && o.marketId.split("/")[1] == withdrawnAssetId)
        .map(bo => bo.quantity);
    if (buyingPricesOrders.length > 0) buyingOrdersValue = buyingPricesOrders.reduce((sum, curr) => sum + curr);

    var sellingOrdersValue = 0;
    const sellingPricesOrders = currentOrders
        .filter(o => o.side === "SELL" && o.marketId.split("/")[0] == withdrawnAssetId)
        .map(so => so.quantity);
    if (sellingPricesOrders.length > 0) sellingOrdersValue = sellingPricesOrders.reduce((sum, curr) => sum + curr);

    if (!withdrawnAsset || withdrawnAsset?.quantity < (order.quantity + sellingOrdersValue + buyingOrdersValue)) {
        return res.status(422).json({
            error: "Balance unavailable"
        });
    };

    const orderId = await createOrder(order);
    res.json({ orderId });
});

// app.get("/getOrders" , async (req: Request, res: Response) => {

// });

app.listen(3000);