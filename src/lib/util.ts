class Util {
    splitNumber(number):string {
        let temp:string = "" + number;
        let temp2:string = "";
        let j = 0;
        for (let i:number = temp.length - 1; i >= 0; i--) {
            if (j == 3) {
                temp2 = "," + temp2;
                j = 1;
            }
            else
                j++;
            temp2 = temp[i] + temp2;
        }
        return temp2;
    }
    DateDif(date):string {
        let date1: Date = new Date(date);
        let date2: Date = new Date((new Date).getTime() + 2 * 1000 * 60 * 60);
        let time: number = (date2.getTime() - date1.getTime()) / 1000;
        if (time < 1) {
            return "now";
        }
        else if (time > 59.999) {
            time /= 60;
            if (time > 59.999) {
                time /= 60;
                if (time > 23.999) {
                    time /= 24;
                    return `${Math.floor(time)}d ago`
                } else {
                    return `${Math.floor(time)}h ago`
                }
            } else {
                return `${Math.floor(time)}m ago`
            }
        } else {
            return `${Math.floor(time)}s ago`
        }

    }
}

module.exports = new Util();