const materials = require('./materials');
const DB = require('./databaseEngine');
const material = require('./material');
const Util = require('./util');

class WebService {
    showDetails(res, material, fullName) {
        let End = [];
        let Start = [];
        let Low = [];
        let High = [];
        let times = [];
        let rows = DB.selectChartDataByMaterial(material);
        rows.forEach(element => {
            times.push(element.date);
            Start.push(element.priceStart);
            End.push(element.priceEnd);
            Low.push(element.priceMin);
            High.push(element.priceMax);
        });
        let Stations = DB.selectTop50StationsByMaterial(material);
        Stations.forEach(element => {
            element.Max = Util.splitNumber(element.max);
            element.Distance = Util.splitNumber(element.distance);
            element.Demand = Util.splitNumber(element.demand);
            element.Updated = Util.DateDif(element.updated)
        });
        res.render('details', {
            "Stations": Stations,
            "FullName": fullName,
            "Name": material,
            "times": JSON.stringify(times),
            "open": JSON.stringify(Start),
            "close": JSON.stringify(End),
            "high": JSON.stringify(High),
            "low": JSON.stringify(Low),
        });
    }
    showPartial(res) {
        let BEN = new material("Benitoite", "BEN");
        let LTD = new material("Low Temperature Diamonds", "LTD");
        let MUS = new material("Musgravite", "MUS");
        let PAI = new material("Painite", "PAI");
        let SER = new material("Serendibite", "SER");
        let VO = new material("Void Opals", "VO");
        BEN = this.getDataFromDB(BEN);
        LTD = this.getDataFromDB(LTD);
        MUS = this.getDataFromDB(MUS);
        PAI = this.getDataFromDB(PAI);
        SER = this.getDataFromDB(SER);
        VO = this.getDataFromDB(VO);
        res.render('partialMain', {
            "Materials": [BEN, LTD, MUS, PAI, SER, VO]
        });
    }
    getDataFromDB(obj) {
        let material = obj.Name;
        let row = DB.selectBestPriceByMaterial(material);
        if (row != null) {
            obj.Max = row.price;
            obj.Station = row.station;
            obj.Update = row.date;
            obj.System = row.system;
        }
        row = DB.selectAvgPriceByMaterial(material);
        if (row != null) {
            obj.Avg = row.price;
        }
        return obj;
    }
    showDetailsPartial(res, material) {

        let Stations = DB.selectTop50StationsByMaterial(material);
        let stations = [];
        Stations.forEach(element => {
            stations.push([element.name, element.system, Util.splitNumber(element.distance), Util.splitNumber(element.max), Util.splitNumber(element.demand), element.pad, Util.DateDif(element.updated)])
        });

        res.json({
            "data": stations
        });
    }
    showIndex(res) {
        let BEN = new material("Benitoite", "BEN");
        let LTD = new material("Low Temperature Diamonds", "LTD");
        let MUS = new material("Musgravite", "MUS");
        let PAI = new material("Painite", "PAI");
        let SER = new material("Serendibite", "SER");
        let VO = new material("Void Opals", "VO");
        BEN = this.getDataFromDB(BEN);
        LTD = this.getDataFromDB(LTD);
        MUS = this.getDataFromDB(MUS);
        PAI = this.getDataFromDB(PAI);
        SER = this.getDataFromDB(SER);
        VO = this.getDataFromDB(VO);
        res.render('index', {
            "Materials": [BEN, LTD, MUS, PAI, SER, VO]
        });
    }
    showChartdata(res, material) {
        let rows =  DB.selectChartDataByMaterial(material);
        res.send(rows)
    }
}

module.exports = new WebService();