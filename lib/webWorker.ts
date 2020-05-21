const WebService = require('./webServices')
const materials = require('./materials') 
class WebWorker {
    FullNames = ["Benitoite", "Low Temperature Diamonds", "Musgravite", "Painite", "Serendibite", "Void Opals"];
    prepareWeb(app) {
        for (let i = 0; i < FullNames.length; i++) {
            let fullName = FullNames[i];
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