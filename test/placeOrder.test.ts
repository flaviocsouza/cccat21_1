import axios from "axios";
import { createAccount, doTransaction } from "../src/account";
import { createOrder, getOrderById } from "../src/order";

axios.defaults.validateStatus = () => true;

test("Deve Retornar 200 Para uma Ordem valida", async () => {
    //Given
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }

    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "BTC",
        quantity: 100
    });
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then
    expect(response.status).toBe(200);
});

test("Deve retornar 404 caso a conta não exista", async () => {
    //Given 
    const request = {
        marketId: "BTC/USD",
        accountId: crypto.randomUUID(),
        side: "BUY",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("Account Not Found");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de compra (Ativo não existe)", async () => {
    //Given 
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de compra (Saldo Insuficiente)", async () => {
    //Given 
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "BTC",
        quantity: 5
    });
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de venda (Ativo não existe)", async () => {
    //Given 
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve retornar 422 caso a conta não possua saldo em uma ordem de venda (Saldo Insuficiente)", async () => {
    //Given 
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "USD",
        quantity: 5
    });
    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");
});

test("Deve Salvar uma ordem de compra", async () => {
    //Given
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "BTC",
        quantity: 100
    });
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    var order = await getOrderById(response.data.orderId);
    
    //Then
    expect(response.status).toBe(200);
    expect(order).toBeDefined();
    expect(order?.marketId).toBe(request.marketId);
    expect(order?.accountId).toBe(accountId);
    expect(order?.side).toBe(request.side);
    expect(order?.quantity).toBe(request.quantity);
    expect(order?.price).toBe(request.price);
});

test("Deve Salvar uma ordem de Venda", async () => {
    //Given
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "USD",
        quantity: 100
    });
    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);
    var order = await getOrderById(response.data.orderId);
    
    //Then
    expect(response.status).toBe(200);
    expect(order).toBeDefined();
    expect(order?.marketId).toBe(request.marketId);
    expect(order?.accountId).toBe(accountId);
    expect(order?.side).toBe(request.side);
    expect(order?.quantity).toBe(request.quantity);
    expect(order?.price).toBe(request.price);
});

test("Deve considerar as Ordens anteriores para autorizar uma Ordem de compra", async() =>
{
     //Given
     var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "BTC",
        quantity: 100
    });
    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 70,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    await createOrder({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    const request = {
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 30,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");

});

test("Deve considerar as Ordens anteriores para autorizar uma Ordem de Venda", async() =>
{
     //Given
     var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "USD",
        quantity: 100
    });
    await createOrder({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    await createOrder({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 30,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then 
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable");

});

test("Deve considerar apenas ativos que serão usados para o pagamento", async () => {
     //Given
     var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    };
    const accountId = await createAccount(account);
    await doTransaction({
        accountId,
        assetId: "USD",
        quantity: 100
    });
    await doTransaction({
        accountId,
        assetId: "BTC",
        quantity: 100
    });
    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 70,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });
    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });
    await createOrder({
        marketId: "USD/BTC",
        accountId: accountId,
        side: "BUY",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });
    await createOrder({
        marketId: "BTC/USD",
        accountId: accountId,
        side: "SELL",
        quantity: 10,
        price: 300,
        orderId: "",
        fillQuantity: 0,
        fillPrice: 0,
        status: "",
        timestamp: new Date()
    });

    const request = {
        marketId: "USD/BTC",
        accountId: accountId,
        side: "SELL",
        quantity: 30,
        price: 300
    };

    //When
    var response = await axios.post("http://localhost:3000/placeOrder", request);

    //Then
    expect(response.status).toBe(200);
});