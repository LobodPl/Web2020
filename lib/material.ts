var Util = require('./util');
var material = function () {
    function material(fullName, name) {
        var _this = this;
        this.better = function () { return _this.Max > _this.Avg; };
        this.worse = function () { return _this.Max < _this.Avg; };
        this.DisplayStation = function () { return this.Station + "(" + this.System + ")"; };
        this.max = function () { return Util.splitNumber(this.Max); };
        this.avg = function () { return Util.splitNumber(Math.round(this.Avg)); };
        this.Name = name;
        this.fullName = fullName;
    }
    return material;
}();
module.exports = material;
