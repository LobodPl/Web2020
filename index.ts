let sqlite3 = require('better-sqlite3');
let express = require('express');
let mustacheExpress = require('mustache-express');
const path = require('path');
const expressVideo = require('express-video');
const EDDN = require('./lib/eddnListener');
const Stats = require('./lib/stats');
const webWorker = require('./lib/webWorker');

const baseSaveinterval = 1000 * 60 * 60

class App {
    constructor(port: number) {
        let app = express();
        app.use('/videos', expressVideo.stream(path.join(__dirname, '/public/vid')));
        app.use(express.static('public'));
        app.set('views', __dirname + "/views");
        app.set('view engine', 'mustache');
        app.engine('mustache', mustacheExpress());

        webWorker.prepareWeb(app);

        app.listen(port, function () {
            console.log('================================\nED-Market listening on port '+port+'!');
        });

        EDDN.ConnectAndSubscribe();
        Stats.prepareMarketData(baseSaveinterval);
    }
}

new App(8080);

