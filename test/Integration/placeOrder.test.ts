import sinon from "sinon";
import { PlaceOrder } from "../../src/PlaceOrder";
import { IAccountDao } from "../../src/AccountDao";
import { IOrderDao } from "../../src/OrderDao";
import { FakeAccountDao } from "../Fake/FakeAccountDao";
import { FakeOrderDao } from "../Fake/FakeOrderDao";
import { Signup } from "../../src/Signup";
import { Deposit } from "../../src/Deposit";
import { GetOrderById } from "../../src/GetOrderById";

function newAccount() {
    return {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
}

let placeOrder: PlaceOrder;
let accountDao: IAccountDao;
let orderDao: IOrderDao;

beforeEach(() => {
    accountDao = new FakeAccountDao()
    orderDao = new FakeOrderDao();
    placeOrder = new PlaceOrder(orderDao, accountDao);
})

test("Deve Salvar uma ordem de compra", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype);
    orderDaoMock.expects("getOrdersByAccountId").once().resolves([]);
    var orderId = crypto.randomUUID();
    orderDaoMock.expects("createOrder").once().resolves(orderId);
    const order = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    const returnPlaceOrder = await placeOrder.execute(order);
    expect(returnPlaceOrder.orderId).toBe(orderId);
    orderDaoMock.verify();
    orderDaoMock.restore();
    accountDaoMock.restore();
});

test("Não deve salvar a ordem caso a conta não exista", async () => {
    const order = {
        marketId: "BTC/USD",
        accountId: crypto.randomUUID(),
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await expect(() => placeOrder.execute(order)).rejects.toThrow("Account Not Found");
});

test("Não deve salvar a ordem caso a conta não possua saldo para a ordem de compra (Ativo não existe)", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(null);
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype);
    orderDaoMock.expects("getOrdersByAccountId").once().resolves([]);
    const order = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await expect(() => placeOrder.execute(order)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
    orderDaoMock.restore();
});

test("Não deve salvar a ordem caso a conta não possua saldo para a ordem de compra (Saldo Insuficiente)", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 5
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype);
    orderDaoMock.expects("getOrdersByAccountId").once().resolves([]);
    const order = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await expect(() => placeOrder.execute(order)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
    orderDaoMock.restore();
});

test("Deve considerar as Ordens anteriores para autorizar uma Ordem de Compra", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const orders = [
        {
            marketId: "BTC/USD",
            accountId: accountId,
            side: "BUY",
            quantity: 70,
            price: 300,
            status: "Created"
        },
        {
            marketId: "BTC/USD",
            accountId: accountId,
            side: "BUY",
            quantity: 10,
            price: 300,
            status: "Created"
        },
        {
            marketId: "USD/BTC",
            accountId: accountId,
            side: "SELL",
            quantity: 10,
            price: 300,
            status: "Created"
        }];
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype);
    orderDaoMock.expects("getOrdersByAccountId").once().resolves(orders);
    const order = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 30,
        price: 300
    };
    await expect(() => placeOrder.execute(order)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
    orderDaoMock.restore();
});


test("Deve considerar as Ordens anteriores para autorizar uma Ordem de Venda", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "USD",
        quantity: 100
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const orders = [
        {
            marketId: "BTC/USD",
            accountId: accountId,
            side: "SELL",
            quantity: 70,
            price: 300,
            status: "Created"
        },
        {
            marketId: "BTC/USD",
            accountId: accountId,
            side: "SELL",
            quantity: 10,
            price: 300,
            status: "Created"
        },
        {
            marketId: "USD/BTC",
            accountId: accountId,
            side: "BUY",
            quantity: 10,
            price: 300,
            status: "Created"
        }];
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype);
    orderDaoMock.expects("getOrdersByAccountId").once().resolves(orders);
    const order = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 30,
        price: 300
    };
    await expect(() => placeOrder.execute(order)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
    orderDaoMock.restore();
});


test("Deve Salvar uma Order Corretamente dentro do Fluxo Correto ", async () => {
    const signupReturn = await new Signup(accountDao).execute(newAccount());
    const deposit = new Deposit(accountDao);
    const getOrderById = new GetOrderById(orderDao);
    const accountId = signupReturn.accountId;
    const previousUsdDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    await deposit.execute(previousUsdDeposit);    
    const newOrder = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 300
    };
    const placeOrderResult = await placeOrder.execute(newOrder);
    const returnOrder = await getOrderById.execute(placeOrderResult.orderId);
    const order = returnOrder.order;
    expect(order.orderId).toBe(placeOrderResult.orderId);
    expect(order.marketId).toBe(newOrder.marketId);
    expect(order.accountId).toBe(newOrder.accountId);
    expect(order.side).toBe(newOrder.side);
    expect(order.quantity).toBe(newOrder.quantity);
    expect(order.price).toBe(newOrder.price);
    expect(order.status).toBe("Created");
});