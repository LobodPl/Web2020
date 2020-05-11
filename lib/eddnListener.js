var got = require('got');
var zlib = require('zlib');
var zmq = require('zeromq');
var sock = zmq.socket('sub');
var DB = require('./databaseEngine');
var EDDN = /** @class */ (function () {
    function EDDN() {
    }
    EDDN.prototype.ConnectAndSubscribe = function () {
        sock.connect('tcp://eddn.edcd.io:9500');
        console.log('================================\nConnected to EDDN');
        sock.subscribe('');
        sock.on('message', function (topic) {
            var data = JSON.parse(zlib.inflateSync(topic));
            if (data.$schemaRef == "https://eddn.edcd.io/schemas/commodity/3") {
                var BEN_1 = data.message.commodities.find(function (x) { return x.name == "benitoite"; }) || { "sellPrice": 0, "demand": 0 };
                var LTD_1 = data.message.commodities.find(function (x) { return x.name == "lowtemperaturediamond"; }) || { "sellPrice": 0, "demand": 0 };
                var MUS_1 = data.message.commodities.find(function (x) { return x.name == "musgravite"; }) || { "sellPrice": 0, "demand": 0 };
                var PAI_1 = data.message.commodities.find(function (x) { return x.name == "painite"; }) || { "sellPrice": 0, "demand": 0 };
                var SER_1 = data.message.commodities.find(function (x) { return x.name == "serendibite"; }) || { "sellPrice": 0, "demand": 0 };
                var VO_1 = data.message.commodities.find(function (x) { return x.name == "opal"; }) || { "sellPrice": 0, "demand": 0 };
                var Station = DB.getStationByMarketId(data.message.marketId);
                if (Station != undefined) {
                    console.log("================================\nUpdating " + data.message.stationName);
                    DB.updateStationWithMarketId(data.message.marketId, BEN_1, LTD_1, MUS_1, PAI_1, SER_1, VO_1);
                }
                else {
                    console.log("================================\nCreating " + data.message.stationName);
                    got("https://www.edsm.net/api-system-v1/stations?systemName=" + data.message.systemName).then(function (data2) {
                        var j = JSON.parse(data2.body);
                        var dist = 0;
                        var Lpad = "M";
                        if (j.stations && j.stations.find(function (x) { return x.name == data.message.stationName; }) != null) {
                            dist = Math.round(j.stations.find(function (x) { return x.name == data.message.stationName; }).distanceToArrival);
                            if (j.stations.find(function (x) { return x.name == data.message.stationName; }).type != "Outpost") {
                                Lpad = "L";
                            }
                        }
                        DB.addNewStation(data.message.stationName, data.message.systemName, BEN_1, LTD_1, MUS_1, PAI_1, SER_1, VO_1, dist, data.message.marketId, Lpad);
                    });
                }
            }
        });
    };
    return EDDN;
}());
module.exports = new EDDN();
