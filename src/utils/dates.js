/**
 *    Created by tomokokawase
 *    On 2018/7/24
 *    阿弥陀佛，没有bug!
 */

// 将秒数转化为可展示的时间
export function SecondToDate(msd) {
    var time = msd;
    // 不用三等是为了规避传入undefined
    if (null != time && "" != time) {
        if (time > 60 && time < 60 * 60) {
            time = parseInt(time / 60.0) + "分钟";
        }
        else if (time >= 60 * 60 && time < 60 * 60 * 24) {
            time = parseInt(time / 3600.0) + "小时";
        } else if (time >= 60 * 60 * 24) {
            time = parseInt(time / 3600.0/24) + "天";
        }
        else {
            time = parseInt(time) + "秒";
        }
    }
    return time;
}

/**
 * 将秒数转化为可展示的模糊时间
 *
 * */
export function SecondToDateBlur(msd) {
    var time = msd;
    // 不用三等是为了规避传入undefined
    if (null != time && "" != time) {
        if (time > 60 && time < 60 * 60) {
            time = parseInt(time / 60.0) + "分钟前";
        }
        else if (time >= 60 * 60 && time < 60 * 60 * 24) {
            let nowTime = new Date();
            let today = nowTime.getDate();
            let now = nowTime.getTime();
            let thatTime = now - time * 1000;
            let thatDay = new Date(thatTime).getDate();
            if (thatDay === today) {
                let desc = new Date(thatTime).toLocaleString().split(' ')[1].split("午")[0] + "午";
                return desc;
            } else {
                // time = parseInt(time / 3600.0) + "小时前";
                return "昨天"
            }
        } else if (time >= 60 * 60 * 24) {
            if(time <= 48 * 60 * 60) {
                return "昨天";
            }
            time = parseInt(time / 3600.0/24) + "天前";
        }
        else {
            time = parseInt(time) + "秒前";
        }
    }
    return time;
}

/**
 *
 * 计算某个距今的时间的秒数差
 * @param  {number} time 毫秒格式的时间
 * @return {number}      相差的毫秒数
*/
export function calcGaptoToday(time) {
    return new Date().getTime() - time
}

// mock一个特定天数前的时间
export function mockTime(number) {
    return new Date().getTime() - number * 24 * 3600 * 1000;
}

/**
 * 将日期转化为 MM.DD格式
 * @param  {number} time 毫秒格式的时间
 * @return {string}      MM.DD格式的字符串
 **/
export function formatMMDD(time) {
    let tempDate = new Date(time);
    let month = tempDate.getMonth();
    month += 1;
    // if (month < 10) month = "0"+month;
    let date = tempDate.getDate();
    // if (date < 10) date = "0"+date;
    return month+"-"+date;
}

/**
 * 将2018-08-19T01:30:02.266Z这种格式转换为毫秒数
 * */
export function transferTZ(rawTime) {
    let DatePiceses = rawTime.split('T')[0];
    let timePiceses = rawTime.split('T')[1].split('.')[0];
    let combineTime = DatePiceses+" "+timePiceses;
    return new Date(combineTime).getTime();
}

/**
 * 将毫秒数转化为YYYY MM DD格式
 * */
export function transferNormal(minSecond) {
    let dates = new Date(minSecond);
    return (dates.getMonth() + 1)+ "月" + (dates.getDate()) + "日"
}