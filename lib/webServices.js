var materials = require('./materials');
var DB = require('./databaseEngine');
var material = require('./material');
var Util = require('./util');
var WebService = /** @class */ (function () {
    function WebService() {
    }
    WebService.prototype.showDetails = function (res, material, fullName) {
        var End = [];
        var Start = [];
        var Low = [];
        var High = [];
        var times = [];
        var rows = DB.selectChartDataByMaterial(material);
        rows.forEach(function (element) {
            times.push(element.date);
            Start.push(element.priceStart);
            End.push(element.priceEnd);
            Low.push(element.priceMin);
            High.push(element.priceMax);
        });
        var Stations = DB.selectTop50StationsByMaterial(material);
        Stations.forEach(function (element) {
            element.Max = Util.splitNumber(element.max);
            element.Distance = Util.splitNumber(element.distance);
            element.Demand = Util.splitNumber(element.demand);
            element.Updated = Util.DateDif(element.updated);
        });
        res.render('details', {
            "Stations": Stations,
            "FullName": fullName,
            "Name": material,
            "times": JSON.stringify(times),
            "open": JSON.stringify(Start),
            "close": JSON.stringify(End),
            "high": JSON.stringify(High),
            "low": JSON.stringify(Low)
        });
    };
    WebService.prototype.showPartial = function (res) {
        var BEN = new material("Benitoite", "BEN");
        var LTD = new material("Low Temperature Diamonds", "LTD");
        var MUS = new material("Musgravite", "MUS");
        var PAI = new material("Painite", "PAI");
        var SER = new material("Serendibite", "SER");
        var VO = new material("Void Opals", "VO");
        BEN = this.getDataFromDB(BEN);
        LTD = this.getDataFromDB(LTD);
        MUS = this.getDataFromDB(MUS);
        PAI = this.getDataFromDB(PAI);
        SER = this.getDataFromDB(SER);
        VO = this.getDataFromDB(VO);
        res.render('partialMain', {
            "Materials": [BEN, LTD, MUS, PAI, SER, VO]
        });
    };
    WebService.prototype.getDataFromDB = function (obj) {
        var material = obj.Name;
        var row = DB.selectBestPriceByMaterial(material);
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
    };
    WebService.prototype.showDetailsPartial = function (res, material) {
        var Stations = DB.selectTop50StationsByMaterial(material);
        var stations = [];
        Stations.forEach(function (element) {
            stations.push([element.name, element.system, Util.splitNumber(element.distance), Util.splitNumber(element.max), Util.splitNumber(element.demand), element.pad, Util.DateDif(element.updated)]);
        });
        res.json({
            "data": stations
        });
    };
    WebService.prototype.showIndex = function (res) {
        var BEN = new material("Benitoite", "BEN");
        var LTD = new material("Low Temperature Diamonds", "LTD");
        var MUS = new material("Musgravite", "MUS");
        var PAI = new material("Painite", "PAI");
        var SER = new material("Serendibite", "SER");
        var VO = new material("Void Opals", "VO");
        BEN = this.getDataFromDB(BEN);
        LTD = this.getDataFromDB(LTD);
        MUS = this.getDataFromDB(MUS);
        PAI = this.getDataFromDB(PAI);
        SER = this.getDataFromDB(SER);
        VO = this.getDataFromDB(VO);
        res.render('index', {
            "Materials": [BEN, LTD, MUS, PAI, SER, VO]
        });
    };
    WebService.prototype.showChartdata = function (res, material) {
        var rows = DB.selectChartDataByMaterial(material);
        res.send(rows);
    };
    return WebService;
}());
module.exports = new WebService();
