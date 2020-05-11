let got = require('got');
const zlib = require('zlib');
const zmq = require('zeromq');
const sock = zmq.socket('sub');
const DB = require('./databaseEngine');

class EDDN{
    ConnectAndSubscribe() {
        sock.connect('tcp://eddn.edcd.io:9500');
        console.log('================================\nConnected to EDDN');
    
        sock.subscribe('');
    
        sock.on('message', topic => {
            let data = JSON.parse(zlib.inflateSync(topic));
            if (data.$schemaRef == "https://eddn.edcd.io/schemas/commodity/3") {
                let BEN = data.message.commodities.find(x => x.name == "benitoite") || { "sellPrice": 0, "demand": 0 };
                let LTD = data.message.commodities.find(x => x.name == "lowtemperaturediamond") || { "sellPrice": 0, "demand": 0 };
                let MUS = data.message.commodities.find(x => x.name == "musgravite") || { "sellPrice": 0, "demand": 0 };
                let PAI = data.message.commodities.find(x => x.name == "painite") || { "sellPrice": 0, "demand": 0 };
                let SER = data.message.commodities.find(x => x.name == "serendibite") || { "sellPrice": 0, "demand": 0 };
                let VO = data.message.commodities.find(x => x.name == "opal") || { "sellPrice": 0, "demand": 0 };
                let Station = DB.getStationByMarketId(data.message.marketId);
                if (Station != undefined) {
                    console.log("================================\nUpdating " + data.message.stationName);
                    DB.updateStationWithMarketId(data.message.marketId,BEN,LTD,MUS,PAI,SER,VO)
                } else {
                    console.log("================================\nCreating " + data.message.stationName);
                    got("https://www.edsm.net/api-system-v1/stations?systemName=" + data.message.systemName).then(function (data2) {
                        const j = JSON.parse(data2.body);
                        let dist = 0;
                        let Lpad = "M";
                        if (j.stations && j.stations.find(function (x) { return x.name == data.message.stationName; }) != null) {
                            dist = Math.round(j.stations.find(function (x) { return x.name == data.message.stationName; }).distanceToArrival);
                            if (j.stations.find(function (x) { return x.name == data.message.stationName; }).type != "Outpost") {
                                Lpad = "L";
                            }
                        } 
                        DB.addNewStation(data.message.stationName,data.message.systemName,BEN,LTD,MUS,PAI,SER,VO,dist,data.message.marketId,Lpad);
                    });
                }
            }
        });
    }
}

module.exports = new EDDN();