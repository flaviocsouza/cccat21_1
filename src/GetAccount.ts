import { IAccountDao } from "./AccountDao";

export class GetAccount{
    dao: IAccountDao;
    constructor(dao: IAccountDao) {        
        this.dao = dao;
    }

    public async execute(accountId: any){
        const account = await this.dao.getAccountById(accountId);
        account.Assets = await this.dao.getAccountAssets(accountId);
        return account
    }

}