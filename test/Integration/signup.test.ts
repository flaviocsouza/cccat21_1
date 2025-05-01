import axios from "axios";
import { Signup } from "../../src/Signup";
import { GetAccount } from "../../src/GetAccount";
import { FakeAccountDao } from "../Fake/FakeAccountDao";

axios.defaults.validateStatus = () => true;

let signup: Signup;
let getAccount: GetAccount;

beforeEach(() => {
    const accountDao = new FakeAccountDao();
    signup = new Signup(accountDao);
    getAccount = new GetAccount(accountDao);
})

test("Deve criar uma conta válida", async () => {
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    };
    const outputSignup = await signup.execute(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.account.name).toBe(inputSignup.name);
    expect(outputGetAccount.account.email).toBe(inputSignup.email);
    expect(outputGetAccount.account.document).toBe(inputSignup.document);
});

test("Não deve criar uma conta com nome inválido", async () => {
    const inputSignup = {
        name: "John",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid name");
});

test("Não deve criar uma conta com email inválido", async () => {
    const inputSignup = {
        name: "John Doe",
        email: "john.doe",
        document: "97456321558",
        password: "asdQWE123"
    }
    await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid email");
});

test.each([
    "111",
    "abc",
    "7897897897"
])("Não deve criar uma conta com cpf inválido", async (document: string) => {
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document,
        password: "asdQWE123"
    }
    await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid document");
});

test("Não deve criar uma conta com senha inválida", async () => {
    const inputSignup = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE"
    }
    await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid password");
});
