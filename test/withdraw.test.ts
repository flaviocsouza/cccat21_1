import axios from "axios";
import { createAccount, doTransaction, getAccountBalance, getAccountBalanceByAsset } from "../src/account";

axios.defaults.validateStatus = () => true;

test("Deve Retornar 200 para uma solicitação valida", async () => {
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
        quantity: 20
    });
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    expect(response.status).toBe(200);
});

test("Deve Retornar 404 para uma conta inexistente", async () => {
    var accountId = crypto.randomUUID();
    var request = {
        accountId,
        assetId: "BTC",
        quantity: 10
    };

    var response = await axios.post("http://localhost:3000/withdraw", request);

    expect(response.status).toBe(404);
    expect(response.data.error).toBe("Account Not Found");
})

test("Deve Retornar 422 quando o Ativo for invalido", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }

    const accountId = await createAccount(account);
    const request = {
        accountId: accountId,
        assetId: "XXXX",
        quantity: 10
    };
    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Asset")

});

test("Deve Retornar 422 quando a quantidade for negativa", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }

    const accountId = await createAccount(account);
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: -10
    };
    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Quantity")

});

test("Deve Retornar 422 quando tentar sacar um ativo inexistente para a conta", async () => {
    var account = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }

    const accountId = await createAccount(account);
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable")

});


test("Deve Retornar 422 quando tentar um valor maior que o disponível", async () => {
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
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable")
});

test("Deve Decrementar Corretamente o Valor Sacado da Conta", async() => {
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
        quantity: 30
    });
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };

    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    var balance = await getAccountBalanceByAsset(accountId, "BTC");
    expect(response.status).toBe(200)
    expect(balance).toBeDefined();
    expect(balance?.quantity).toBe(20);
});

test("Deve Decrementar Apenas o Valor do Ativo Sacado", async() => {
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
        quantity: 30
    });
    await doTransaction({
        accountId,
        assetId: "USD",
        quantity: 50
    });
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    //When
    var response = await axios.post("http://localhost:3000/withdraw", request);

    //Then
    var balance = await getAccountBalance(accountId);
    var btcBalance =  balance.find(a => a.assetId === "BTC");
    var usdBalance =  balance.find(a => a.assetId === "USD");

    expect(response.status).toBe(200)
    expect(balance).toBeDefined();
    expect(btcBalance?.quantity).toBe(20);
    expect(usdBalance?.quantity).toBe(50);
})