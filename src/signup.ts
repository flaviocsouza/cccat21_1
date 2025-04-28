import express, { Request, Response } from "express";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
import { createAccount, getAccountById } from "./account";

const app = express();
app.use(express.json());

// const accounts: any = [];
const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function isValidName (name: string) {
    return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail (email: string) {
    return email.match(/^(.+)\@(.+)$/);
}

function isValidPassword (password: string) {
    if (password.length < 8) return false;
    if (!password.match(/\d+/)) return false;
    if (!password.match(/[a-z]+/)) return false;
    if (!password.match(/[A-Z]+/)) return false;
    return true;
}

app.post("/signup", async (req: Request, res: Response) => {
    const input = req.body;
    if (!isValidName(input.name)) {
        return res.status(422).json({
            error: "Invalid name"
        });
    }
    if (!isValidEmail(input.email)) {
        return res.status(422).json({
            error: "Invalid email"
        });
    }
    if (!validateCpf(input.document)) {
        return res.status(422).json({
            error: "Invalid document"
        });
    }
    if (!isValidPassword(input.password)) {
        return res.status(422).json({
            error: "Invalid password"
        });
    }
   
    const account = {
        name: input.name,
        email: input.email,
        document: input.document,
        password: input.password
    }
    // accounts.push(account);
    const accountId = await createAccount(account);
    res.json({
        accountId
    });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    // const account = accounts.find((account: any) => account.accountId === accountId);
    const [accountData] = await getAccountById(accountId);
    res.json(accountData);
});

app.listen(3000);