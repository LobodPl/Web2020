var materials = require('./materials');
var DB = require('./databaseEngine');
var Markethistory = require('./prices');
var Stats = /** @class */ (function () {
    function Stats() {
    }
    Stats.prototype.save1min = function (baseinterval) {
        var _this = this;
        var temparray = [];
        for (var i = 0; i < materials.length; i++) {
            var material = materials[i];
            var row = DB.selectBestPriceByMaterial(material);
            temparray.push(row.price);
        }
        Markethistory.updatePrices(temparray);
        setTimeout(function () {
            _this.save1min(baseinterval);
        }, baseinterval / 60);
    };
    Stats.prototype.save60min = function (Markethistory) {
        console.log("================================\nClosing market session");
        for (var i = 0; i < materials.length; i++) {
            var material = materials[i];
            var row = DB.selectBestPriceByMaterial(material);
            Markethistory.updatePrice(row.price, material);
            DB.addNewMarketSessionByMaterialInMarketHistory(material, Markethistory);
        }
        Markethistory.prepareMarketData();
    };
    Stats.prototype.checksave = function () {
        if (new Date().getMinutes() == 0 && new Date().getSeconds() == 0) {
            this.save60min(Markethistory);
        }
    };
    Stats.prototype.prepareMarketData = function (baseSaveinterval) {
        var _this = this;
        Markethistory.prepareMarketData();
        this.save1min(baseSaveinterval);
        setInterval(function () {
            _this.checksave();
        }, 1000);
    };
    return Stats;
}());
module.exports = new Stats();
