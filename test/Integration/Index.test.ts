import axios from "axios";
import { GetDepth } from "../../src/GetDepth";

axios.defaults.validateStatus = () => true;

function newAccount() {
    return {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
}

test("Signup => Deve criar uma conta válida", async () => {
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
    const outputSignup = responseSignup.data;
    expect(outputSignup.accountId).toBeDefined();
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
    const outputGetAccount = responseGetAccount.data.account;
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.document).toBe(inputSignup.document);
});

test("Signup => Não deve criar uma conta com nome inválido", async () => {
    const inputSignup = {
        name: "John",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
    const outputSignup = responseSignup.data;
    expect(responseSignup.status).toBe(422);
    expect(outputSignup.error).toBe("Invalid name");
});

test("Deposit => Deve Gravar Corretamente Depositos Validos", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestBtcAsset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", requestBtcAsset);
    let requestUsdAsset = {
        accountId: accountId,
        assetId: "USD",
        quantity: 70
    };
    var response = await axios.post("http://localhost:3000/deposit", requestUsdAsset);
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 20
    };
    var response = await axios.post("http://localhost:3000/deposit", request)
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${accountId}`);
    const account = responseGetAccount.data.account;
    const balance = account.Assets.find((a:any) => a.assetId === "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(30);
});

test("Deposit => Não deve criar um deposito Invalido", async () => {
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "XXX",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", request)
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Asset")
});

test("Withdraw => Deve fazer um Saque corretamente", async() => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestBtcDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 30
    };
    var response = await axios.post("http://localhost:3000/deposit", requestBtcDeposit)
    const requestUsdDeposit = {
        accountId,
        assetId: "USD",
        quantity: 50
    };
    var response = await axios.post("http://localhost:3000/deposit", requestUsdDeposit)
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${accountId}`);
    const account = responseGetAccount.data.account;
    var btcBalance =  account.Assets.find((a:any) => a.assetId === "BTC");
    var usdBalance =  account.Assets.find((a:any) => a.assetId === "USD");
    expect(response.status).toBe(200)
    expect(account.Assets).toBeDefined();
    expect(btcBalance?.quantity).toBe(20);
    expect(usdBalance?.quantity).toBe(50);
});

test("Withdraw => Não Permitir um Saque invalido", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 5
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable")
});

test("Place Order => Deve Salvar uma Ordem corretamente", async () => {
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

test("Place Order => Não deve salvar uma Ordem com Saldo Insuficiente", async () => {
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

test("GetDepth => Deve obter o Depth corretamente", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDepositBtc = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositBtc);
    const requestDepositUsd = {
        accountId: accountId,
        assetId: "USD",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositUsd);
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 59000
    });     
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 35,
        price: 53000
    });  
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 53030
    });
    const response = await axios.get("http://localhost:3000/getDepth?marketId=USD/BTC&precision=3")
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.buys).toBeDefined();
    expect(response.data.sells).toBeDefined();
});


test("GetDepth => Deve obter o Depth corretamente aceitando precision como um parametro opcional", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDepositBtc = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositBtc);
    const requestDepositUsd = {
        accountId: accountId,
        assetId: "USD",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositUsd);
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 59000
    });     
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 35,
        price: 53000
    });  
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 53030
    });
    const response = await axios.get("http://localhost:3000/getDepth?marketId=USD/BTC")
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.buys).toBeDefined();
    expect(response.data.sells).toBeDefined();
});

test("GetDepth => Deve retornar erro ao enviar informações invalidas", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDepositBtc = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositBtc);
    const requestDepositUsd = {
        accountId: accountId,
        assetId: "USD",
        quantity: 99999999
    };
    await axios.post("http://localhost:3000/deposit", requestDepositUsd);
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 59000
    });     
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 35,
        price: 53000
    });  
    await axios.post("http://localhost:3000/placeOrder", {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 53030
    });
    const response = await axios.get("http://localhost:3000/getDepth?marketId=USD/XXX")
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Asset");
})