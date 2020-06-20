let express = require('express');
let mustacheExpress = require('mustache-express');
let path = require('path');
let expressVideo = require('express-video');
let EDDN = require('./lib/eddnListener');
let Stats = require('./lib/stats');
let webWorker = require('./lib/webWorker');

let baseSaveinterval = 1000 * 60 * 60

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
            console.log('[WebServer] -> ED-Market listening on port '+port+'!');
        });

        EDDN.ConnectAndSubscribe();
        Stats.prepareMarketData(baseSaveinterval);
    }
}

new App(8080);

