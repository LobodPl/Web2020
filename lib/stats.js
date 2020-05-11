const materials = require('./materials');
const DB = require('./databaseEngine');
const Markethistory = require('./prices');

class Stats {
    save1min(baseinterval) {
        let temparray = [];
        for (let i = 0; i < materials.length; i++) {
            let material = materials[i];
            let row = DB.selectBestPriceByMaterial(material);
            temparray.push(row.price);
        }
        Markethistory.updatePrices(temparray);
        setTimeout(() => {
            this.save1min(baseinterval);
        }, baseinterval / 60);
    }
    save60min(Markethistory) {
        console.log("================================\nClosing market session");
        for (let i = 0; i < materials.length; i++) {
            let material = materials[i];
            let row = DB.selectBestPriceByMaterial(material)
            Markethistory.updatePrice(row.price, material);
            DB.addNewMarketSessionByMaterialInMarketHistory(material, Markethistory);
        }
        Markethistory.prepareMarketData();
    }
    checksave() {
        if (new Date().getMinutes() == 0 && new Date().getSeconds() == 0) {
            this.save60min(Markethistory);
        }
    }
    prepareMarketData(baseSaveinterval) {
        Markethistory.prepareMarketData();
        this.save1min(baseSaveinterval);
        setInterval(() => {
            this.checksave();
        }, 1000)
    }

}

module.exports = new Stats();