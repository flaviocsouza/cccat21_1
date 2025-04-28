import axios from "axios";
import { createAccount, getAccountBalanceByAsset, transactNewAsset } from "../src/account";

axios.defaults.validateStatus = () => true;

test("Deve retornar sucesso ao receber uma Transação Valida", async () => {
    //given    
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }

    const accountId =  await createAccount(account);
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    
    //when
    
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    expect(response.status).toBe(200);

});

test("Deve retornar 422 quando um ativo for inválido", async () => {
    //given
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "XXX",
        quantity: 10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Asset")
});

test("Deve retornar 422 quando a quantidade for menor que zero", async () => {
    //given
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: -10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Quantity Must Be Greater Than Zero");
});

test("Deve retornar 422 quando a Conta não existir", async () => {
    //given
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: 10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Account Not Found");
});

test("Deve persistir o deposito para um ativo existente", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }
    const accountId =  await createAccount(account);    
    let transaction =  {
        accountId: accountId, 
        assetId: "BTC",
        quantity: 20
    };    
    await transactNewAsset(transaction);
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    const balance = await getAccountBalanceByAsset(accountId, "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(30);    
});

test("Deve persistir o deposito para um ativo Inexistente", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }
    const accountId =  await createAccount(account);    
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    const balance = await getAccountBalanceByAsset(accountId, "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(10);    
});

test("Deve alterar apenas os ativos do Id Informado", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }
    const accountId =  await createAccount(account);    
    
    let transaction =  {
        accountId: accountId, 
        assetId: "BTC",
        quantity: 20
    };    
    await transactNewAsset(transaction);

    transaction =  {
        accountId: accountId, 
        assetId: "USD",
        quantity: 70
    };    
    await transactNewAsset(transaction);

    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //when
    var response = await axios.post("http://localhost:3000/deposit", request)

    //then
    const balance = await getAccountBalanceByAsset(accountId, "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(30);    
});