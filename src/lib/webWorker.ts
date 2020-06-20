export {};
let WebService = require('./webServices');
let materials = require('./materials');
class WebWorker {
    FullNames: string[] = ["Benitoite", "Low Temperature Diamonds", "Musgravite", "Painite", "Serendibite", "Void Opals"];
    prepareWeb(app) : void {
        for (let i = 0; i < this.FullNames.length; i++) {
            let fullName = this.FullNames[i];
            app.get('/' + materials[i], function (req, res) {
                WebService.showDetails(res, materials[i], fullName);
            });
            app.get('/' + materials[i] + '/Chart', function (req, res) {
                WebService.showChartdata(res, materials[i]);
            });
            app.get('/' + materials[i] + '/Partial', function (req, res) {
                WebService.showDetailsPartial(res, materials[i]);
            });
        }
        app.get('/', function (req, res) {
            WebService.showIndex(res);
        });
        app.get('/Partial', function (req, res) {
            WebService.showPartial(res);
        });

    }
}
module.exports = new WebWorker();