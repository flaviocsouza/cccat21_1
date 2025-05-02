import sinon from "sinon";
import { GetDepth } from "../../src/GetDepth";
import { FakeOrderDao } from "../Fake/FakeOrderDao";

let getDepth: GetDepth;
beforeEach(() => {
    const orderDao = new FakeOrderDao();
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
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype)
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
    const orderDaoMock = sinon.mock(FakeOrderDao.prototype)
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