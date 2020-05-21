const DB = require('./databaseEngine')
const materials = require('./materials');
class Price{
    MarketData = {};
    prepareMarketData() {
        console.log("================================\nStarting new market session");
        for (let i = 0; i < materials.length; i++) {
            let material = materials[i];
            const lastprice = DB.selectLastEndPriceByMaterial(material);
            MarketData[material] = [parseInt(lastprice.price), 0, parseInt(lastprice.price), parseInt(lastprice.price)];
            if (MarketData[material][0] == 0) {
                let row = DB.selectBestPriceByMaterial(material);
                MarketData[material][0] = row.price;
            }
        }
    }
    
    updatePrices(Prices) {
        console.log("================================\nUpdating price table");
        for (let i = 0; i < materials.length; i++) {
            let material = materials[i];
            if (Prices[i] < 2300000) {
                if (MarketData[material][2] < Prices[i]) {
                    MarketData[material][2] = Prices[i];
                }
                if ((MarketData[material][3] > Prices[i] && Prices[i] != 0) || MarketData[material][3] == 0) {
                    MarketData[material][3] = Prices[i];
                }
                MarketData[material][1] = Prices[i];
            }
            console.log(material + ":" + JSON.stringify(MarketData[material]));
    
        }
    }
    
    updatePrice(Price, material) {
        if (Price < 2300000) {
            if (MarketData[material][2] < Price) {
                MarketData[material][2] = Price;
            }
            if ((MarketData[material][3] > Price && Price != 0) || MarketData[material][3] == 0) {
                MarketData[material][3] = Price;
            }
            MarketData[material][1] = Price;
        }
    }
}

module.exports = new Price();