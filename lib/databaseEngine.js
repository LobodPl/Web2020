let sqlite3 = require('better-sqlite3');

class DB {
    Constructed;
    constructor() {
        if (this.Constructed == null) {
            this.Constructed = new DB1();
        }
        return this.Constructed;
    }
}

class DB1 {
    openStationsDB() {
        return new sqlite3('./db/stations.db');
    }
    openMarketDB() {
        return new sqlite3('./db/market.db');
    }
    getStationByMarketId(marketId) {
        let db = this.openStationsDB();
        let res = db.prepare("Select * from Stations where marketid = ?").get(marketId);
        db.close();
        return res;
    }
    updateStationWithMarketId(marketId, BEN, LTD, MUS, PAI, SER, VO) {
        let db = this.openStationsDB();
        db.prepare("UPDATE Stations SET benprice=?,bendemand=?,ltdprice=?,ltddemand=?,musprice=?,musdemand=?,paiprice=?,paidemand=?,serprice=?,serdemand=?,voprice=?,vodemand=?,updated=julianday('now','+2 hours') where marketid = ?").run(BEN.sellPrice, BEN.demand, LTD.sellPrice, LTD.demand, MUS.sellPrice, MUS.demand, PAI.sellPrice, PAI.demand, SER.sellPrice, SER.demand, VO.sellPrice, VO.demand, marketId);
        db.close();

    }
    addNewStation(stationName, systemName, BEN, LTD, MUS, PAI, SER, VO, dist, marketId, Lpad) {
        let db = this.openStationsDB();
        db.prepare("INSERT INTO Stations(name,system,benprice,bendemand,ltdprice,ltddemand,musprice,musdemand,paiprice,paidemand,serprice,serdemand,voprice,vodemand,updated,lsfromstar,marketid,largestpad) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,julianday('now','+2 hours'),?,?,?)").run(stationName, systemName, BEN.sellPrice, BEN.demand, LTD.sellPrice, LTD.demand, MUS.sellPrice, MUS.demand, PAI.sellPrice, PAI.demand, SER.sellPrice, SER.demand, VO.sellPrice, VO.demand, dist, marketId, Lpad);
        db.close();

    }
    selectBestPriceByMaterial(material) {
        let db = this.openStationsDB();
        let res = db.prepare("Select " + material.toLowerCase() + "price as price,datetime(updated) as date,name as station,system From Stations Order By price DESC LIMIT 1").get();
        db.close();
        return res;
    }
    selectAvgPriceByMaterial(material) {
        let db = this.openStationsDB();
        let res = db.prepare("Select AVG(price) as price,date From (Select date(updated) as date," + material.toLowerCase() + "price as price from Stations where " + material.toLowerCase() + "demand > 0) Group by date Order By date DESC LIMIT 1").get();
        db.close();
        return res;
    }
    selectChartDataByMaterial(material) {
        let db = this.openMarketDB();
        let res = db.prepare("SELECT priceEnd,priceStart,priceMax,priceMin,datetime(date) as date FROM (SELECT * from " + material + " order by id DESC Limit 24) Order by date ASC Limit 24;").all();
        db.close();
        return res;
    }
    selectTop50StationsByMaterial(material) {
        let db = this.openStationsDB();
        let res = db.prepare("SELECT name,largestpad as pad,system,lsfromstar as distance," + (material.toLowerCase()) + "price as max,datetime(updated) as updated," + (material.toLowerCase()) + "demand as demand from Stations order by max DESC LIMIT 50").all();
        db.close();
        return res;
    }
    addNewMarketSessionByMaterialInMarketHistory(material,Markethistory){
        let db = this.openMarketDB();
        db.prepare("INSERT INTO " + material + "(priceStart,priceEnd,priceMax,priceMin,date) VALUES(?,?,?,?,julianday('now','+2 hours'))").run(Markethistory.MarketData[material][0], Markethistory.MarketData[material][1], Markethistory.MarketData[material][2], Markethistory.MarketData[material][3]);
        db.close();
    }
}

module.exports = new DB();