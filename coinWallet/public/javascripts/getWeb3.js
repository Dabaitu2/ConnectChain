/**
 *    Created by tomokokawase
 *    On 2018/7/20
 *    阿弥陀佛，没有bug!
 */
var Web3 = require('web3');
const {WEB3_PORT, WEB3_URL} = require("./web3Config");


// 这里导入的web3和truffle实际上是分开用的，用于做getAccounts之类的操作

const getWeb3 = function() {
    var provider = new Web3.providers.HttpProvider('http://'+WEB3_URL+':'+WEB3_PORT);
    var web3 = new Web3(provider);
    console.log('已经连接到本地以太坊节点!');
    global.web3 = web3;
    return web3;
};

module.exports = getWeb3;
