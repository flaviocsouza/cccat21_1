import sinon from "sinon";
import { Withdraw } from "../../src/Withdraw";
import { IAccountDao } from "../../src/AccountDao";
import { FakeAccountDao } from "../Fake/FakeAccountDao";
import { Signup } from "../../src/Signup";
import { Deposit } from "../../src/Deposit";
import { GetAccount } from "../../src/GetAccount";


function newAccount() {
    return {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
}

let withdraw: Withdraw;
let accountDao: IAccountDao;

beforeEach(() => {
    accountDao = new FakeAccountDao();
    withdraw = new Withdraw(accountDao);
})

test("Deve Persistir o Saque Corretamente", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    accountDaoMock.expects("updateAssetValue").once().resolves();
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 15
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    await withdraw.execute(transaction);
    accountDaoMock.verify();
    accountDaoMock.restore();
});

test("Não deve realizar um saque para uma conta inexistente", async () => {
    const accountId = crypto.randomUUID();
    const transaction = {
        accountId,
        assetId: "BTC",
        quantity: 10
    };
    await expect(() => withdraw.execute(transaction)).rejects.toThrow("Account Not Found");
});

test("Não deve realizar um saque para um Ativo for invalido", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const transaction = {
        accountId: accountId,
        assetId: "XXXX",
        quantity: 10
    };
    await expect(() => withdraw.execute(transaction)).rejects.toThrow("Invalid Asset");
    accountDaoMock.restore();
});

test("Não deve realizar um saque para uma Quantidade negativa", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: -10
    };
    await expect(() => withdraw.execute(transaction)).rejects.toThrow("Invalid Quantity");
    accountDaoMock.restore();
});

test("Não deve realizar um saque para um ativo inexistente para a conta", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(null);
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    await expect(() => withdraw.execute(transaction)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
});

test("Não deve realizar um saque para um valor maior que o disponível", async () => {
    const accountDaoMock = sinon.mock(FakeAccountDao.prototype);
    const accountId = crypto.randomUUID();
    accountDaoMock.expects("getAccountById").once().resolves({ accountId });
    const asset = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 5
    };
    accountDaoMock.expects("getAccountBalanceByAsset").once().resolves(asset);
    const transaction = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 10
    };
    await expect(() => withdraw.execute(transaction)).rejects.toThrow("Balance unavailable");
    accountDaoMock.restore();
});

test("Deve Trabalhar corretamente com os Valores Sacados", async () => {
    const signupReturn = await new Signup(accountDao).execute(newAccount());
    const accountId = signupReturn.accountId;
    const deposit = new Deposit(accountDao);
    const previousBtcDeposit = {
        accountId: accountId,
        assetId: "BTC",
        quantity: 20
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
        assetId: "USD",
        quantity: 20
    };
    await withdraw.execute(transaction);
    const getAccountReturn = await new GetAccount(accountDao).execute(accountId);
    const btcBalance = getAccountReturn.account.Assets.find((a: any) => a.assetId === "BTC");
    const usdBalance = getAccountReturn.account.Assets.find((a: any) => a.assetId === "USD");
    expect(btcBalance?.quantity).toBe(20);
    expect(usdBalance?.quantity).toBe(50);
})