var WebService = require('./webServices');
var materials = require('./materials');
var WebWorker = /** @class */ (function () {
    function WebWorker() {
        this.FullNames = ["Benitoite", "Low Temperature Diamonds", "Musgravite", "Painite", "Serendibite", "Void Opals"];
    }
    WebWorker.prototype.prepareWeb = function (app) {
        var _loop_1 = function (i) {
            var fullName = this_1.FullNames[i];
            app.get('/' + materials[i], function (req, res) {
                WebService.showDetails(res, materials[i], fullName);
            });
            app.get('/' + materials[i] + '/Chart', function (req, res) {
                WebService.showChartdata(res, materials[i]);
            });
            app.get('/' + materials[i] + '/Partial', function (req, res) {
                WebService.showDetailsPartial(res, materials[i]);
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.FullNames.length; i++) {
            _loop_1(i);
        }
        app.get('/', function (req, res) {
            WebService.showIndex(res);
        });
        app.get('/Partial', function (req, res) {
            WebService.showPartial(res);
        });
    };
    return WebWorker;
}());
module.exports = new WebWorker();
