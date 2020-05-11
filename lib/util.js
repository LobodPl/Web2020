var Util = /** @class */ (function () {
    function Util() {
    }
    Util.prototype.splitNumber = function (number) {
        var temp = "" + number;
        var temp2 = "";
        var j = 0;
        for (var i = temp.length - 1; i >= 0; i--) {
            if (j == 3) {
                temp2 = "," + temp2;
                j = 1;
            }
            else
                j++;
            temp2 = temp[i] + temp2;
        }
        return temp2;
    };
    Util.prototype.DateDif = function (date) {
        var date1 = new Date(date);
        var date2 = new Date((new Date).getTime() + 2 * 1000 * 60 * 60);
        var time = (date2.getTime() - date1.getTime()) / 1000;
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
                        return Math.floor(time) + " day ago";
                    }
                    else {
                        return Math.floor(time) + " days ago";
                    }
                }
                else {
                    if (time < 2) {
                        return Math.floor(time) + " hour ago";
                    }
                    else {
                        return Math.floor(time) + " hours ago";
                    }
                }
            }
            else {
                if (time < 2) {
                    return Math.floor(time) + " minute ago";
                }
                else {
                    return Math.floor(time) + " minutes ago";
                }
            }
        }
        else {
            if (time < 2) {
                return Math.floor(time) + " second ago";
            }
            else {
                return Math.floor(time) + " seconds ago";
            }
        }
    };
    return Util;
}());
module.exports = new Util();
