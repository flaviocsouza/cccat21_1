import { IAccountDao } from "./AccountDao";
import { validateCpf } from "./validateCpf";

export class Signup {

    private dao: IAccountDao;
    constructor(dao: IAccountDao) {
        this.dao = dao;
     }

    public async execute(account: any) {
        if (!this.isValidName(account.name)) throw new Error("Invalid name");
        if (!this.isValidEmail(account.email)) throw new Error("Invalid email");
        if (!validateCpf(account.document)) throw new Error("Invalid document");
        if (!this.isValidPassword(account.password)) throw new Error("Invalid password");
        const accountId = await this.dao.createAccount(account);        
        return { accountId };
    }

    private isValidName (name: string) {
        return name.match(/[a-zA-Z] [a-zA-Z]+/);
    }
    
    private isValidEmail (email: string) {
        return email.match(/^(.+)\@(.+)$/);
    }

    private isValidPassword (password: string) {
        if (password.length < 8) return false;
        if (!password.match(/\d+/)) return false;
        if (!password.match(/[a-z]+/)) return false;
        if (!password.match(/[A-Z]+/)) return false;
        return true;
    }
}