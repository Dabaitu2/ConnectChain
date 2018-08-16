/**
 *    Created by tomokokawase
 *    On 2018/7/19
 *    阿弥陀佛，没有bug!
 */
var request = require('request');
request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx7d35e97bd960cbf1&secret=fac527010ad01813af26f3b606946386', function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body)
    }
});