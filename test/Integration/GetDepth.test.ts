import sinon from "sinon";
import { GetDepth } from "../../src/GetDepth";
import { FakeOrderDao } from "../Fake/FakeOrderDao";
import { PlaceOrder } from "../../src/PlaceOrder";
import { IOrderDao, OrderDao } from "../../src/OrderDao";
import { AccountDao, IAccountDao } from "../../src/AccountDao";
import { FakeAccountDao } from "../Fake/FakeAccountDao";
import { Signup } from "../../src/Signup";
import { Deposit } from "../../src/Deposit";

let getDepth: GetDepth;
let orderDao: IOrderDao;
let accountDao: IAccountDao;

beforeEach(() => {
    // orderDao = new FakeOrderDao();
    // accountDao = new FakeAccountDao();
    orderDao = new OrderDao();
    accountDao = new AccountDao();
    getDepth = new GetDepth(orderDao);
});

test("Deve Retornar duas listas uma de Compras e uma de Vendas", async () => {
    const depth = { marketId: "BTC/USD", precision: 3 };
    var getDepthReturn = await getDepth.execute(depth);
    expect(getDepthReturn.buys).toBeDefined();
    expect(getDepthReturn.sells).toBeDefined();
});

test("Deve Validar se os ativos do Market Id existem", async () => {
    const depth = { marketId: "BTC/YYY", precision: 3 }
    await expect(() => getDepth.execute(depth)).rejects.toThrow("Invalid Asset")
});

test("Deve Validar se a precisão é maior que zero", async () => {
    const depth = { marketId: "BTC/USD", precision: -3 }
    await expect(() => getDepth.execute(depth)).rejects.toThrow("Invalid Precision")
});

test("Dada uma lista de Ordens deve separar corretamente as ordens de Compra e venda", async () => {
    const orderDaoMock = sinon.mock(OrderDao.prototype)
    const orderList = []
    for (let i = 0; i < 10; i++)
        orderList.push({
            orderId: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            marketId: "BTC/USD",
            side: i % 2 === 0 ? "BUY" : "SELL",
            quantity: 10,
            price: i * 10000,
            status: "Created"
        });
    orderDaoMock.expects("getOrdersByMarketId").once().resolves(orderList)
    const depth = { marketId: "BTC/USD", precision: 0 }
    const depthReturn = await getDepth.execute(depth);
    expect(depthReturn.buys).toHaveLength(5);
    expect(depthReturn.sells).toHaveLength(5);
    orderDaoMock.restore();
});


test("Dada uma lista de Ordens deve separar e agrupar corretamente as ordens de Compra e venda de acordo com a precisão", async () => {
    const orderDaoMock = sinon.mock(OrderDao.prototype)
    const orderList = []
    for (let i = 0; i < 11; i++)
        orderList.push({
            orderId: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            marketId: "BTC/USD",
            side: i % 2 === 0 ? "BUY" : "SELL",
            quantity: 10,
            price: 4000 + (i * 100),
            status: "Created"
        });
    orderDaoMock.expects("getOrdersByMarketId").once().resolves(orderList)
    const depth = { marketId: "BTC/USD", precision: 3 }
    const depthReturn = await getDepth.execute(depth);
    expect(depthReturn.buys).toHaveLength(2);
    expect(depthReturn.sells).toHaveLength(1);
    orderDaoMock.restore();
});

test("Criada uma série de ordens deve filtrar, separar e agrupar corretamente as ordens de compra e venda de acordo com a precisão", async () =>{
    const signup = new Signup(accountDao);
    const returnSignup = await signup.execute({
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    });
    const accountId = returnSignup.accountId;
    const deposit = new Deposit(accountDao);
    await deposit.execute({ accountId: accountId, assetId: "BTC", quantity: 99999999 });
    await deposit.execute({ accountId: accountId, assetId: "USD", quantity: 99999999 });
    const placeOrder = new PlaceOrder(orderDao, accountDao);    
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 59000
    });  
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 20,
        price: 59400
    });      
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 60000
    });  
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 59499
    });  
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 59900
    });   
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 59400
    });  
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 35,
        price: 53000
    });  
    await placeOrder.execute({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 53030
    });      
    const notFindOrder = await placeOrder.execute({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 53030
    });
    const depthChart = await getDepth.execute({ marketId: "USD/BTC", precision: 3 });
    expect(depthChart.buys).toHaveLength(2);
    expect(depthChart.buys[0].mergedOrders).toHaveLength(2);    
    expect(depthChart.buys[0].quantity).toBe(20);
    expect(depthChart.buys[0].price).toBe(59000);
    expect(depthChart.buys[1].mergedOrders).toHaveLength(2);    
    expect(depthChart.buys[1].quantity).toBe(45);
    expect(depthChart.buys[1].price).toBe(53000);
    expect(depthChart.sells).toHaveLength(2);
    expect(depthChart.sells[0].mergedOrders).toHaveLength(3);
    expect(depthChart.sells[0].quantity).toBe(100);
    expect(depthChart.sells[0].price).toBe(59000);
    expect(depthChart.sells[1].mergedOrders).toHaveLength(1);
    expect(depthChart.sells[1].quantity).toBe(10);
    expect(depthChart.sells[1].price).toBe(60000);
    expect(depthChart.buys[0].mergedOrders.find((o:any) => o.orderId === notFindOrder)).toBeUndefined();
    expect(depthChart.buys[1].mergedOrders.find((o:any) => o.orderId === notFindOrder)).toBeUndefined();
    const depthChartPrecisionTwo = await getDepth.execute({ marketId: "USD/BTC", precision: 2 });
    expect(depthChartPrecisionTwo.buys).toHaveLength(3);
    expect(depthChartPrecisionTwo.buys[0].mergedOrders).toHaveLength(1);
    expect(depthChartPrecisionTwo.buys[1].mergedOrders).toHaveLength(1);
    expect(depthChartPrecisionTwo.buys[2].mergedOrders).toHaveLength(2);
    expect(depthChartPrecisionTwo.sells).toHaveLength(3);
    expect(depthChartPrecisionTwo.sells[0].mergedOrders).toHaveLength(1);
    expect(depthChartPrecisionTwo.sells[1].mergedOrders).toHaveLength(2);
    expect(depthChartPrecisionTwo.sells[2].mergedOrders).toHaveLength(1);
});