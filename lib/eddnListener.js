var got = require('got');
var zlib = require('zlib');
var zmq = require('zeromq/v5-compat');
var sock = zmq.socket('sub');
var DB = require('./databaseEngine');
var config = require('./constants');
var EDDN = /** @class */ (function () {
    function EDDN() {
    }
    EDDN.prototype.ConnectAndSubscribe = function () {
        sock.connect(config.eddnSocketAddress);
        console.log('================================\nConnected to EDDN');
        sock.subscribe('');
        sock.on('message', function (topic) {
            var data = JSON.parse(zlib.inflateSync(topic));
            if (data.$schemaRef == config.eddnSchemaAddress) {
                var BEN_1 = data.message.commodities.find(function (x) { return x.name == "benitoite"; }) || { "sellPrice": 0, "demand": 0 };
                var LTD_1 = data.message.commodities.find(function (x) { return x.name == "lowtemperaturediamond"; }) || { "sellPrice": 0, "demand": 0 };
                var MUS_1 = data.message.commodities.find(function (x) { return x.name == "musgravite"; }) || { "sellPrice": 0, "demand": 0 };
                var PAI_1 = data.message.commodities.find(function (x) { return x.name == "painite"; }) || { "sellPrice": 0, "demand": 0 };
                var SER_1 = data.message.commodities.find(function (x) { return x.name == "serendibite"; }) || { "sellPrice": 0, "demand": 0 };
                var VO_1 = data.message.commodities.find(function (x) { return x.name == "opal"; }) || { "sellPrice": 0, "demand": 0 };
                var Station = DB.getStationByMarketId(data.message.marketId);
                if (Station != undefined) {
                    console.log("================================\nUpdating " + data.message.stationName);
                    if (Station.lsfromstar == 0) {
                        got(config.edsmAddress + data.message.systemName.replace("+", "%2B")).then(function (data2) {
                            var j = JSON.parse(data2.body);
                            var dist = 0;
                            dist = Math.round(j.stations.find(function (x) { return x.marketId == data.message.marketId; }).distanceToArrival);
                            console.log("================================\nMissing DIST found!! New dist: " + dist);
                            DB.updateStationWithMarketIdDist(data.message.marketId, BEN_1, LTD_1, MUS_1, PAI_1, SER_1, VO_1, dist);
                        });
                    }
                    else {
                        DB.updateStationWithMarketId(data.message.marketId, BEN_1, LTD_1, MUS_1, PAI_1, SER_1, VO_1);
                    }
                }
                else {
                    console.log("================================\nCreating " + data.message.stationName);
                    got(config.edsmAddress + data.message.systemName.replace("+", "%2B")).then(function (data2) {
                        var j = JSON.parse(data2.body);
                        var dist = 0;
                        var Lpad = "M";
                        if (j.stations && j.stations.find(function (x) { return x.marketId == data.message.marketId; }) != null) {
                            dist = Math.round(j.stations.find(function (x) { return x.marketId == data.message.marketId; }).distanceToArrival);
                            if (j.stations.find(function (x) { return x.marketId == data.message.marketId; }).type != "Outpost") {
                                Lpad = "L";
                            }
                        }
                        DB.addNewStation(data.message.stationName, data.message.systemName, BEN_1, LTD_1, MUS_1, PAI_1, SER_1, VO_1, dist, data.message.marketId, Lpad);
                    });
                }
            }
        });
        sock.on('disconnect', function () {
            sock.connect(config.eddnSocketAddress);
            sock.subscribe('');
        });
    };
    return EDDN;
}());
module.exports = new EDDN();
