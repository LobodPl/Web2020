var constatnts = /** @class */ (function () {
    function constatnts() {
        this.eddnSocketAddress = "tcp://eddn.edcd.io:9500";
        this.eddnSchemaAddress = "https://eddn.edcd.io/schemas/commodity/3";
        this.edsmAddress = "https://www.edsm.net/api-system-v1/stations?systemName=";
    }
    return constatnts;
}());
module.exports = new constatnts();
