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

test("Deve Retornar 200 para uma solicitação valida", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    console.log(response.data)
    expect(response.status).toBe(200);
});

test("Deve Retornar 422 para uma conta inexistente", async () => {
    var accountId = crypto.randomUUID();
    var request = {
        accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Account Not Found");
});

test("Deve Retornar 422 quando o Ativo for invalido", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        accountId: accountId,
        assetId: "XXXX",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Asset");
});

test("Deve Retornar 422 quando a quantidade for negativa", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: -10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid Quantity")
});

test("Deve Retornar 422 quando tentar sacar um ativo inexistente para a conta", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Balance unavailable")
});


test("Deve Retornar 422 quando tentar um valor maior que o disponível", async () => {
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

test("Deve Decrementar Corretamente o Valor Sacado da Conta", async() => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 30
    };
    var response = await axios.post("http://localhost:3000/deposit", requestDeposit)
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/withdraw", request);
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${accountId}`);
    const account = responseGetAccount.data.account;
    const balance = account.Assets.find((a:any) => a.assetId === "BTC");
    expect(response.status).toBe(200)
    expect(balance).toBeDefined();
    expect(balance?.quantity).toBe(20);
});

test("Deve Decrementar Apenas o Valor do Ativo Sacado", async() => {
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
})