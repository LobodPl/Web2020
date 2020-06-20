export {};
let Util = require('./util');
let material = function () {
    function material(fullName, name) {
        let _this = this;
        this.better = function ():boolean { return _this.Max > _this.Avg; };
        this.worse = function ():boolean { return _this.Max < _this.Avg; };
        this.DisplayStation = function ():string { return this.Station + "(" + this.System + ")"; };
        this.max = function ():string { return Util.splitNumber(this.Max); };
        this.avg = function ():string { return Util.splitNumber(Math.round(this.Avg)); };
        this.Name = name;
        this.fullName = fullName;
    }
    return material;
}();
module.exports = material;
