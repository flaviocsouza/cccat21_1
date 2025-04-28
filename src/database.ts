import pgp from "pg-promise";

const connection = pgp({
    receive(e) {
        camelizeColumns(e.data);
    }
})("postgres://postgres:123456@localhost:5432/app");
function camelizeColumns(data:any) {
    const tmp = data[0];
    for (const prop in tmp) {
        const camel = pgp.utils.camelize(prop);
        if (!(camel in tmp)) {
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                d[camel] = d[prop];
                delete d[prop];
            }
        }
    }
}

const accountScripts  = {
    insertAccountScript:  "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
    selectAccountScript:  "select * from ccca.account where account_id = $1",
    selectAccountAssetsScript:  "select * from ccca.account_asset where account_id = $1",
    selectAccountAssetByIdScript:  "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
    updtateExistingAssetScript:  "update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3",
    insertNewAssetScript:  "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",    
}

const orderScripts = {
    insertOrder: "insert into ccca.order(order_id, market_id, account_id,	side, quantity,	price, fill_quantity, fill_price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    selectOrdersByAccountId:"select * from ccca.order where account_id = $1",
    selectOrderById: "select * from ccca.order where order_id = $1"
}





export { connection, accountScripts, orderScripts }