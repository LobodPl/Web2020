var sqlite3 = require('better-sqlite3');
var express = require('express');
var mustacheExpress = require('mustache-express');
var path = require('path');
var expressVideo = require('express-video');
var EDDN = require('./lib/eddnListener');
var Stats = require('./lib/stats');
var webWorker = require('./lib/webWorker');
var baseSaveinterval = 1000 * 60 * 60;
var App = /** @class */ (function () {
    function App(port) {
        var app = express();
        app.use('/videos', expressVideo.stream(path.join(__dirname, '/public/vid')));
        app.use(express.static('public'));
        app.set('views', __dirname + "/views");
        app.set('view engine', 'mustache');
        app.engine('mustache', mustacheExpress());
        webWorker.prepareWeb(app);
        app.listen(port, function () {
            console.log('================================\nED-Market listening on port ' + port + '!');
        });
        EDDN.ConnectAndSubscribe();
        Stats.prepareMarketData(baseSaveinterval);
    }
    return App;
}());
new App(8080);
