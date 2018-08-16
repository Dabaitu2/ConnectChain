/**
 *    Created by tomokokawase
 *    On 2018/8/6
 *    阿弥陀佛，没有bug!
 */
const OurCoins  = artifacts.require("./OurcCoins");
const Eutil	    = require('ethereumjs-util');

const amt_1 = web3.toWei(1, 'ether');
let coin = null;
let accounts = web3.eth.accounts;

module.exports = function(callback) {
    OurCoins.deployed().then(rst => {
        coin = rst;
        return coin;
    }).then(coin => {
        coin.buy(0, {from: accounts[0], value: 33 * amt_1});
    });
};