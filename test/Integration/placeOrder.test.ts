import axios from "axios";

axios.defaults.validateStatus = () => true;

function newAccount() {
    return {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
}

test("Deve Retornar 200 Para uma Ordem valida", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(200);
});

test("Deve retornar erro caso a conta não exista", async () => {
    const request = {
        marketId: "BTC/USD",
        accountId: crypto.randomUUID(),
        side: "BUY",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Account Not Found");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de compra (Ativo não existe)", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de compra (Saldo Insuficiente)", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 5
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de venda (Ativo não existe)", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de venda (Saldo Insuficiente)", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 5
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve Salvar uma ordem de compra", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    const responsePlaceOrder = await axios.post("http://localhost:3000/placeOrder", request);
    const outputPlaceOrder = responsePlaceOrder.data;
    expect(responsePlaceOrder.status).toBe(200);
    expect(outputPlaceOrder.orderId).toBeDefined();
    const getOrderResponse = await axios.get(`http://localhost:3000/order/${outputPlaceOrder.orderId}`);
    const order = getOrderResponse.data.order;
    expect(order.marketId).toBe(request.marketId);
    expect(order.accountId).toBe(accountId);
    expect(order.side).toBe(request.side);
    expect(order.quantity).toBe(request.quantity);
    expect(order.price).toBe(request.price);
});

test("Deve Salvar uma ordem de Venda", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId,
        assetId: "USD",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestDeposit);
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    const responsePlaceOrder = await axios.post("http://localhost:3000/placeOrder", request);
    const outputPlaceOrder = responsePlaceOrder.data;
    expect(responsePlaceOrder.status).toBe(200);
    expect(outputPlaceOrder.orderId).toBeDefined();
    const getOrderResponse = await axios.get(`http://localhost:3000/order/${outputPlaceOrder.orderId}`);
    const order = getOrderResponse.data.order;
    expect(order).toBeDefined();
    expect(order?.marketId).toBe(request.marketId);
    expect(order?.accountId).toBe(accountId);
    expect(order?.side).toBe(request.side);
    expect(order?.quantity).toBe(request.quantity);
    expect(order?.price).toBe(request.price);
});

test("Deve considerar as Ordens anteriores para autorizar uma Ordem de compra", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestDeposit);
    const firstOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 70,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", firstOrderRequest);
    const secondOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", secondOrderRequest);
    const thirdOrderRequest = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", thirdOrderRequest);
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 30,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");

});

test("Deve considerar as Ordens anteriores para autorizar uma Ordem de Venda", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "USD",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestDeposit);
    const firstOrderRequest = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", firstOrderRequest);
    const secondOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", secondOrderRequest);
    const thirdOrderRequest = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", thirdOrderRequest);
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 30,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");

});

test("Deve considerar apenas ativos que serão usados para o pagamento", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestUsdDeposit = {
        accountId: accountId,
        assetId: "USD",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestUsdDeposit);
    const requestBtcDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 100
    };
    await axios.post("http://localhost:3000/deposit", requestBtcDeposit);
    const firstOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", firstOrderRequest);
    const secondOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", secondOrderRequest);
    const thirdOrderRequest = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", thirdOrderRequest);
    const fourthOrderRequest = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };
    await axios.post("http://localhost:3000/placeOrder", fourthOrderRequest);
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 30,
        price: 300
    };
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    expect(response.status).toBe(200);
});