export class GetTrade {
    
    validAssets = ["BTC", "USD"]

    public async execute(marketId: string) {
        if(!this.isMarketValid(marketId)) throw new Error("Invalid Asset");
        return [];
    }

    isMarketValid(marketId: string) {        
        return true
        
    }

    private getAssetsByMarket(marketId: string): string[] {
        return marketId.split("/")
    }
}