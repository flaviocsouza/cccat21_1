import { GetTrade } from "../../src/GetTrades";

let getTrade: GetTrade;
beforeEach(() => {
    getTrade = new GetTrade();
});

test("Deve Retornar uma lista dos trades filtrados pelo marketId ", async () => {
    const trades = await getTrade.execute("BTC/USD");
    expect(trades).toBeDefined();
});

test("Deve lançar uma excessão no caso de um MarketId com assets Invalidos", async () => {
    expect(async() => await getTrade.execute("USD/YYY")).rejects.toThrow("Invalid Asset");
});