let sqlite3 = require('better-sqlite3');
let express = require('express');
let mustacheExpress = require('mustache-express');
let app = express();
const path = require('path');
const expressVideo = require('express-video');
let got = require('got');
const zlib = require('zlib');
const zmq = require('zeromq');
const sock = zmq.socket('sub');

app.use('/videos', expressVideo.stream(path.join(__dirname, '/public/vid')));
app.use(express.static('public'));
app.set('views', __dirname + "/views");
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.get('/BEN', function (req, res) {
    showDetails(res, "BEN", "Benitoite");
});
app.get('/BEN/Chart', function (req, res) {
    showChartdata(res, "BEN");
});
app.get('/BEN/Partial', function (req, res) {
    showDetailsPartial(res, "BEN");
});

app.get('/LTD', function (req, res) {
    showDetails(res, "LTD", "Low Temperature Diamonds");
});
app.get('/LTD/Chart', function (req, res) {
    showChartdata(res, "LTD");
});
app.get('/LTD/Partial', function (req, res) {
    showDetailsPartial(res, "LTD");
});

app.get('/MUS', function (req, res) {
    showDetails(res, "MUS", "Musgravite");
});
app.get('/MUS/Chart', function (req, res) {
    showChartdata(res, "MUS");
});
app.get('/MUS/Partial', function (req, res) {
    showDetailsPartial(res, "MUS");
});

app.get('/PAI', function (req, res) {
    showDetails(res, "PAI", "Painite");
});
app.get('/PAI/Chart', function (req, res) {
    showChartdata(res, "PAI");
});
app.get('/PAI/Partial', function (req, res) {
    showDetailsPartial(res, "PAI");
});

app.get('/SER', function (req, res) {
    showDetails(res, "SER", "Serendibite");
});
app.get('/SER/Chart', function (req, res) {
    showChartdata(res, "SER");
});
app.get('/SER/Partial', function (req, res) {
    showDetailsPartial(res, "SER");
});

app.get('/VO', function (req, res) {
    showDetails(res, "VO", "Void Opals");
});
app.get('/VO/Chart', function (req, res) {
    showChartdata(res, "VO");
});
app.get('/VO/Partial', function (req, res) {
    showDetailsPartial(res, "VO");
});
app.get('/Partial', function (req, res) {
    showPartial(res);
});
app.get('/', function (req, res) {
    let BEN = new material("Benitoite", "BEN");
    let LTD = new material("Low Temperature Diamonds", "LTD");
    let MUS = new material("Musgravite", "MUS");
    let PAI = new material("Painite", "PAI");
    let SER = new material("Serendibite", "SER");
    let VO = new material("Void Opals", "VO");
    BEN = getDataFromDB(BEN);
    LTD = getDataFromDB(LTD);
    MUS = getDataFromDB(MUS);
    PAI = getDataFromDB(PAI);
    SER = getDataFromDB(SER);
    VO = getDataFromDB(VO);
    res.render('index', {
        "Materials": [BEN, LTD, MUS, PAI, SER, VO]
    });
});
app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
function StartUp() {
    sock.connect('tcp://eddn.edcd.io:9500');
    console.log('Connected to EDDN');

    sock.subscribe('');

    sock.on('message', topic => {
        let data = JSON.parse(zlib.inflateSync(topic));
        if (data.$schemaRef == "https://eddn.edcd.io/schemas/commodity/3") {
            let db = new sqlite3('./db/stations.db');
            let BEN = data.message.commodities.find(x => x.name == "benitoite") || { "sellPrice": 0, "demand": 0 };
            let LTD = data.message.commodities.find(x => x.name == "lowtemperaturediamond") || { "sellPrice": 0, "demand": 0 };
            let MUS = data.message.commodities.find(x => x.name == "musgravite") || { "sellPrice": 0, "demand": 0 };
            let PAI = data.message.commodities.find(x => x.name == "painite") || { "sellPrice": 0, "demand": 0 };
            let SER = data.message.commodities.find(x => x.name == "serendibite") || { "sellPrice": 0, "demand": 0 };
            let VO = data.message.commodities.find(x => x.name == "opal") || { "sellPrice": 0, "demand": 0 };

            let test = db.prepare("Select * from Stations where marketid = ?").get(data.message.marketId);
            if (test != undefined) {
                console.log("================================\nUpdating " + data.message.stationName);
                db.prepare("UPDATE Stations SET benprice=?,bendemand=?,ltdprice=?,ltddemand=?,musprice=?,musdemand=?,paiprice=?,paidemand=?,serprice=?,serdemand=?,voprice=?,vodemand=?,updated=julianday('now','+2 hours') where marketid = ?").run(BEN.sellPrice, BEN.demand, LTD.sellPrice, LTD.demand, MUS.sellPrice, MUS.demand, PAI.sellPrice, PAI.demand, SER.sellPrice, SER.demand, VO.sellPrice, VO.demand, data.message.marketId);
                db.close();
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
                    } db.prepare("INSERT INTO Stations(name,system,benprice,bendemand,ltdprice,ltddemand,musprice,musdemand,paiprice,paidemand,serprice,serdemand,voprice,vodemand,updated,lsfromstar,marketid,largestpad) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,julianday('now','+2 hours'),?,?,?)").run(data.message.stationName, data.message.systemName, BEN.sellPrice, BEN.demand, LTD.sellPrice, LTD.demand, MUS.sellPrice, MUS.demand, PAI.sellPrice, PAI.demand, SER.sellPrice, SER.demand, VO.sellPrice, VO.demand, dist, data.message.marketId, Lpad);
                    db.close();
                });
            }
        }
    });
}
StartUp();
class material {
    Max: number;
    Name: string;
    Avg: number;
    Update: string;
    Station: string;
    System: string;
    fullName: string;
    better = () => { return this.Max > this.Avg };
    worse = () => { return this.Max < this.Avg };
    constructor(fullName, name) {
        this.Name = name;
        this.fullName = fullName;
    }
    DisplayStation = function () { return this.Station + "(" + this.System + ")"; };
    max = function () { return splitNumber(this.Max) };
    avg = function () { return splitNumber(Math.round(this.Avg)) };
}

function splitNumber(number) {
    let temp = "" + number;
    let temp2 = "";
    let j = 0;
    for (let i = temp.length - 1; i >= 0; i--) {
        if (j == 3) {
            temp2 = "," + temp2;
            j = 1;
        }
        else
            j++;
        temp2 = temp[i] + temp2;
    }
    return temp2;
}
function getDataFromDB(obj) {
    let material = obj.Name;
    let db = new sqlite3('./db/stations.db');
    let rows = db.prepare("Select " + material.toLowerCase() + "price as price,datetime(updated) as date,name as station,system From Stations Order By price DESC LIMIT 1").all();
    if (rows.length != 0) {
        obj.Max = rows[0].price;
        obj.Station = rows[0].station;
        obj.Update = rows[0].date;
        obj.System = rows[0].system;
    }
    rows = db.prepare("Select AVG(price) as price,date From (Select date(updated) as date," + material.toLowerCase() + "price as price from Stations where " + material.toLowerCase() + "demand > 0) Group by date Order By date DESC LIMIT 1").all();
    if (rows != null && rows.length != 0) {
        obj.Avg = rows[0].price;
    }
    db.close();
    return obj;
}

function showDetails(res, material, fullName) {
    let db = new sqlite3('./db/stations.db');
    let db1 = new sqlite3('./db/market.db');
    let prices = [];
    let times = [];
    let rows = db1.prepare("SELECT price,datetime(date) as date FROM (SELECT * from "+material+" order by id DESC Limit 144) Order by date ASC Limit 144;").all();
    rows.forEach(element => {
        times.push(element.date);
        prices.push(element.price);
    });
    db1.close();
    let Stations = db.prepare("SELECT name,largestpad as pad,system,lsfromstar as distance," + (material.toLowerCase()) + "price as max,datetime(updated) as updated," + (material.toLowerCase()) + "demand as demand from Stations order by max DESC LIMIT 10").all();
    db.close();
    Stations.forEach(element => {
        element.Max = splitNumber(element.max);
        element.Distance = splitNumber(element.distance);
        element.Demand = splitNumber(element.demand);
        element.Updated = DateDif(element.updated)
    });
    res.render('details', {
        "Stations": Stations,
        "FullName": fullName,
        "Name": material,
        "times" : JSON.stringify(times),
        "prices" : JSON.stringify(prices)
    });
}

function showDetailsPartial(res, material) {
    let db = new sqlite3('./db/stations.db');
    let Stations = db.prepare("SELECT name,largestpad as pad,system,lsfromstar as distance," + (material.toLowerCase()) + "price as max,datetime(updated) as updated," + (material.toLowerCase()) + "demand as demand from Stations order by max DESC LIMIT 50").all();
    db.close();
    let stations = [];
    Stations.forEach(element => {
        stations.push([element.name,element.system,splitNumber(element.distance),splitNumber(element.max),splitNumber(element.demand),element.pad, DateDif(element.updated)])
    });
    
    res.json({
        "data": stations
    });
}

function showPartial(res) {
    let BEN = new material("Benitoite", "BEN");
    let LTD = new material("Low Temperature Diamonds", "LTD");
    let MUS = new material("Musgravite", "MUS");
    let PAI = new material("Painite", "PAI");
    let SER = new material("Serendibite", "SER");
    let VO = new material("Void Opals", "VO");
    BEN = getDataFromDB(BEN);
    LTD = getDataFromDB(LTD);
    MUS = getDataFromDB(MUS);
    PAI = getDataFromDB(PAI);
    SER = getDataFromDB(SER);
    VO = getDataFromDB(VO);
    res.render('partialMain', {
        "Materials": [BEN, LTD, MUS, PAI, SER, VO]
    });
}

function DateDif(date) {
    let date1 = new Date(date);
    let date2 = new Date((new Date).getTime() + 2 * 1000 * 60 * 60);
    let time = (date2.getTime() - date1.getTime()) / 1000;
    if (time < 1) {
        return "now";
    }
    else if (time > 59.999) {
        time /= 60;
        if (time > 59.999) {
            time /= 60;
            if (time > 23.999) {
                time /= 24;
                if (time < 2) {
                    return `${Math.floor(time)} day ago`
                } else {
                    return `${Math.floor(time)} days ago`
                }
            } else {
                if (time < 2) {
                    return `${Math.floor(time)} hour ago`
                } else {
                    return `${Math.floor(time)} hours ago`
                }
            }
        } else {
            if (time < 2) {
                return `${Math.floor(time)} minute ago`
            } else {
                return `${Math.floor(time)} minutes ago`
            }
        }
    } else {
        if (time < 2) {
            return `${Math.floor(time)} second ago`
        } else {
            return `${Math.floor(time)} seconds ago`
        }
    }

}
setInterval(save10min,1000*60*10);
function save10min(){
    let db1 = new sqlite3('./db/market.db');
    let db2 = new sqlite3('./db/stations.db');
    let materials =["BEN", "LTD", "MUS", "PAI", "SER", "VO"];
    for(let i =0;i<materials.length;i++){
        let material = materials[i];
        let row = db2.prepare("Select " + material.toLowerCase() + "price as price From Stations Order By price DESC LIMIT 1").get();
        db1.prepare("INSERT INTO " + material + "(price,date) VALUES(?,julianday('now','+2 hours'))").run(row.price);

    }
    db1.close();
    db2.close()
}

function showChartdata(res,material){
    let db = new sqlite3('./db/market.db');
    let rows = db.prepare("SELECT price,datetime(date) as date FROM (SELECT * from "+material+" order by id DESC Limit 144) Order by date ASC Limit 144;").all();
    res.send(rows)
    db.close();
}