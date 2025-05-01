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

test("Deve retornar sucesso ao receber uma Transação Valida", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", request)
    expect(response.status).toBe(200);
});

test("Deve retornar 422 quando um ativo for inválido", async () => {
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

test("Deve retornar 422 quando a quantidade for menor que zero", async () => {
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: -10
    };
    var response = await axios.post("http://localhost:3000/deposit", request);
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Quantity Must Be Greater Than Zero");
});

test("Deve retornar 422 quando a Conta não existir", async () => {
    var accouuntId = crypto.randomUUID();
    const request = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", request)
    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Account Not Found");
});


test("Deve persistir o deposito para um ativo Inexistente", async () => {
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const request = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", request);    
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${accountId}`);
    const account = responseGetAccount.data.account;
    const balance = account.Assets.find((a:any) => a.assetId === "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(10);
});

test("Deve persistir o deposito para um ativo existente", async () => {    
    const responseSignup = await axios.post("http://localhost:3000/signup", newAccount());
    const accountId = responseSignup.data.accountId;
    const requestNewAsset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    var response = await axios.post("http://localhost:3000/deposit", requestNewAsset);
    const requestExistingAsset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 20
    };
    var response = await axios.post("http://localhost:3000/deposit", requestExistingAsset)
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${accountId}`);
    const account = responseGetAccount.data.account;
    const balance = account.Assets.find((a:any) => a.assetId === "BTC");
    expect(response.status).toBe(200);
    expect(balance!.quantity).toBe(30);
});

test("Deve alterar apenas os ativos do Id Informado", async () => {
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