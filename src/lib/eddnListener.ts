export {};
let got = require('got');
let zlib = require('zlib');
let zmq = require('zeromq/v5-compat');
let sock = zmq.socket('sub');
let DB = require('./databaseEngine');

class EDDN {
    ConnectAndSubscribe() {
        sock.connect('tcp://eddn.edcd.io:9500');
        console.log('[EDDN] -> Connected to EDDN');

        sock.subscribe('');

        sock.on('message', topic => {
            let data = JSON.parse(zlib.inflateSync(topic));
            if (data.$schemaRef == "https://eddn.edcd.io/schemas/commodity/3") {
                let BEN: object = data.message.commodities.find(x => x.name == "benitoite") || { "sellPrice": 0, "demand": 0 };
                let LTD: object = data.message.commodities.find(x => x.name == "lowtemperaturediamond") || { "sellPrice": 0, "demand": 0 };
                let MUS: object = data.message.commodities.find(x => x.name == "musgravite") || { "sellPrice": 0, "demand": 0 };
                let PAI: object = data.message.commodities.find(x => x.name == "painite") || { "sellPrice": 0, "demand": 0 };
                let SER: object = data.message.commodities.find(x => x.name == "serendibite") || { "sellPrice": 0, "demand": 0 };
                let VO: object = data.message.commodities.find(x => x.name == "opal") || { "sellPrice": 0, "demand": 0 };
                let Station = DB.getStationByMarketId(data.message.marketId);
                if (Station != undefined) {
                    console.log("[Price] -> Updating " + data.message.stationName);
                    if (Station.lsfromstar == 0) {
                        got("https://www.edsm.net/api-system-v1/stations?systemName=" + data.message.systemName.replace("+", "%2B")).then(function (data2) {
                            const j = JSON.parse(data2.body);
                            let dist = 0;
                            dist = Math.round(j.stations.find(function (x) { return x.marketId == data.message.marketId; }).distanceToArrival);
                            console.log("================================\nMissing DIST found!! New dist: " + dist);
                            DB.updateStationWithMarketIdDist(data.message.marketId, BEN, LTD, MUS, PAI, SER, VO, dist)
                        });
                    } else {
                        DB.updateStationWithMarketId(data.message.marketId, BEN, LTD, MUS, PAI, SER, VO)
                    }
                } else {
                    console.log("[Price] -> Creating " + data.message.stationName);
                    got("https://www.edsm.net/api-system-v1/stations?systemName=" + data.message.systemName.replace("+", "%2B")).then(function (data2) {
                        const j = JSON.parse(data2.body);
                        let dist = 0;
                        let Lpad = "M";
                        if (j.stations && j.stations.find(function (x) { return x.marketId == data.message.marketId; }) != null) {
                            dist = Math.round(j.stations.find(function (x) { return x.marketId == data.message.marketId; }).distanceToArrival);
                            if (j.stations.find(function (x) { return x.marketId == data.message.marketId; }).type != "Outpost") {
                                Lpad = "L";
                            }
                        }
                        DB.addNewStation(data.message.stationName, data.message.systemName, BEN, LTD, MUS, PAI, SER, VO, dist, data.message.marketId, Lpad);
                    });
                }
            }
        });
        sock.on('disconnect', () => {
            sock.connect('tcp://eddn.edcd.io:9500');
            sock.subscribe('');
        });
    }
}

module.exports = new EDDN();