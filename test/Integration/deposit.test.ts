import sinon from "sinon";
import { Deposit } from "../../src/Deposit";
import { Signup } from "../../src/Signup";
import { GetAccount } from "../../src/GetAccount";
import { IAccountDao } from "../../src/AccountDao";
import { FakeAccountDao } from "../Fake/FakeAccountDao";


let deposit: Deposit;
let accountDao: IAccountDao;

function newAccount() {
    return {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
}

beforeEach(() => {
    accountDao = new FakeAccountDao();
    deposit = new Deposit(accountDao);
});

test("Deve persistir o deposito para um ativo Inexistente", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    accountDaoMock.expects("createAsset").once().resolves();
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(null);
    await deposit.execute(transaction);
    accountDaoMock.verify();
    accountDaoMock.restore();
});

test("Deve persistir o deposito para um ativo existente", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    accountDaoMock.expects("updateAssetValue").once().resolves();
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const previousAsset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(previousAsset);
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 20
    };
    await deposit.execute(transaction)
    accountDaoMock.verify();
    accountDaoMock.restore();
});


test("Näo deve efetuar um Deposito de Asset Invalido", async () => {
    var accouuntId = crypto.randomUUID();
    const transaction = {
        accountId: accouuntId,
        assetId: "XXX",
        quantity: 10
    };
    await expect(() => deposit.execute(transaction)).rejects.toThrow("Invalid Asset");
});

test("Não deve efetuar um deposito com uma quantidade menor que Zero", async () => {
    var accouuntId = crypto.randomUUID();
    const transaction = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: -10
    };
    await expect(() => deposit.execute(transaction)).rejects.toThrow("Quantity Must Be Greater Than Zero");
});

test("Não deve efetuar um deposito para uma conta Inexistente", async () => {
    var accouuntId = crypto.randomUUID();
    const transaction = {
        accountId: accouuntId,
        assetId: "BTC",
        quantity: 10
    };
    await expect(() => deposit.execute(transaction)).rejects.toThrow("Account Not Found");
});

test("Deve Trabalhar corretamente com os Valores Depositados", async () => {
    const signupReturn = await new Signup(accountDao).execute(newAccount());
    const accountId = signupReturn.accountId;
    const previousBtcDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    await deposit.execute(previousBtcDeposit);
    const previousUsdDeposit = {
        accountId: accountId,
        assetId: "USD",
        quantity: 70
    };
    await deposit.execute(previousUsdDeposit);
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 20
    };
    await deposit.execute(transaction);
    const getAccountReturn = await new GetAccount(accountDao).execute(accountId);
    const btcBalance = getAccountReturn.account.Assets.find((a: any) => a.assetId === "BTC");
    const usdBalance = getAccountReturn.account.Assets.find((a: any) => a.assetId === "USD");
    expect(btcBalance!.quantity).toBe(30);
    expect(usdBalance!.quantity).toBe(70);
});