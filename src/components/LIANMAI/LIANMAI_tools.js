/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import {getContractAddress, getWrappedConstant, WrapBuyTrasaction, WrapTrasaction} from "../../contractTools/tools";
import {CONTRACT_ADDRESS} from "../../config/web3Config";

/**
 *  包装智能合约的各种方法
 *  这样就能方便的在各种组件中被调用了
 *
 * */
const OurCoins = require("../../utils/Contracts").OurCoins;
const unit     = 10 ** 8;

/**
 * 转发或者回答问题
 * @param {string|number} userId        当前用户的唯一Id
 * @param {string|number} lastId        来源转发者唯一Id
 * @param {string|number} problemId     问题的唯一Id
 * @param {number}        helpType      帮助的类型， 1 为回答，2 为转发
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function answerOrTransfer(userId, lastId, problemId, helpType, Contract, privateKey, account, web3) {
    // let destAddress  = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let serializedTx = await WrapTrasaction("answerOrTransfer",
        [userId, lastId, problemId, helpType],
        Contract,
        privateKey,
        account,
        destAddress,
        web3);
    return serializedTx;
}

/**
 * 第三方登录用户绑定私钥
 * @description 绑定账户的操作交给中心做和自己做是一样的，不过自己做传输层面上更安全，但需要自己的账号上有资金
 * @param {string|number} userId                        当前用户的唯一Id
 * @param {string}        userAddress = account         用户的以太坊地址
 * @param {Contract}      Contract                      获得的Web3Contract实例
 * @param {string}        privateKey                    本地读取的privateKey
 * @param {object}        web3                          远程调用的RPC库
 * */
export async function bindAddress(userId, userAddress, Contract, privateKey, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let serializedTx = await WrapTrasaction("bindAddress",
        [userId, userAddress],
        Contract,
        privateKey,
        userAddress,
        destAddress,
        web3);
    return serializedTx;

}

/**
 * 用户购买代币
 * @param  {string|number}  userId           当前用户的唯一Id
 * @param  {string|number}  number           用户购买代币的数量
 * @param  {Contract}       Contract         获得的Web3Contract实例
 * @param  {string}         privateKey       本地读取的privateKey
 * @param  {object}         web3             远程调用的RPC库
 * @param  {string}         account          用户的以太坊地址
 * */
export async function buy(userId, number, Contract, privateKey, account, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let numBerInWei = (number * 0.0005 * 10 ** 18).toString();
    let serializedTx = await WrapBuyTrasaction("buy",
        [userId],
        Contract,
        privateKey,
        account,
        destAddress,
        web3,
        numBerInWei);
    return serializedTx;

}
/**
 * 用户修改绑定的以太坊地址
 * @param   {string|number}  userId             当前用户的唯一Id
 * @param   {string|number}  new_userAddress    用户的新地址
 * @param   {Contract}       Contract           获得的Web3Contract实例
 * @param   {string}         privateKey         本地读取的privateKey
 * @param   {object}         web3               远程调用的RPC库
 * @param   {string}         account            用户的以太坊地址
 * */
export async function changeAddress(userId, new_userAddress, Contract, privateKey, account, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let serializedTx = await WrapTrasaction("changeAddress",
        [userId, new_userAddress],
        Contract,
        privateKey,
        account,
        destAddress,
        web3);
    return serializedTx;
}

/**
 * 提问者采纳答案
 * @param {string|number} userId        当前用户的唯一Id
 * @param {string|number} problemId     问题的唯一Id
 * @param {string|number} ansId         指定的回答者的Id
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function chooseAnswer(userId, problemId, ansId, Contract, privateKey, account, web3) {
    let destAddress = CONTRACT_ADDRESS;
    let serializedTx = await WrapTrasaction("chooseAnwser",
        [userId, problemId, ansId],
        Contract,
        privateKey,
        account,
        destAddress,
        web3);
    return serializedTx;
}

/**
 * 提问者发布问题
 * @param {string|number} userId        当前用户的唯一Id
 * @param {string|number} coins         用户悬赏金额
 * @param {string|number} problemId     问题的唯一Id
 * @param {number}        limit         用户设置的答题限制时间
 * @param {number}        model         用户选择的分成模式(2-8, 3-7, 4-6, 5-5)
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function publish(userId, coins, problemId, limit, model, Contract, privateKey, account, web3) {
    let destAddress = CONTRACT_ADDRESS;
    let serializedTx = await WrapTrasaction("publish",
        [userId, coins, problemId, limit, model],
        Contract,
        privateKey,
        account,
        destAddress,
        web3);
    return serializedTx;
}

/**
 * 用户将代币提现
 * @param {string|number} userId        当前用户的唯一Id
 * @param {string|number} coins         用户悬赏金额
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function sell(userId, coins, Contract, privateKey, account, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    console.log(destAddress);
    let serializedTx = await WrapTrasaction("sell",
        [userId, coins],
        Contract,
        privateKey,
        account,
        destAddress,
        web3);
    return serializedTx;
}

/**
 * CALL 方法
 * 获取某ID用户的以太坊地址
 * @param {string|number} userId        查询的Id
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function AddressOf(userId, Contract, privateKey, account, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let constantObj = await getWrappedConstant("AddressOf", [], destAddress, account);
    return constantObj;
}

/**
 * CALL 方法
 * 获取某以太坊地址的本项目ID
 * @param {string|number} address       查询的地址
 * @param {Contract}      Contract      获得的Web3Contract实例
 * @param {string}        privateKey    本地读取的privateKey
 * @param {object}        web3          远程调用的RPC库
 * @param {string}        account       用户的以太坊地址
 * */
export async function IdOf(address, Contract, privateKey, account, web3) {
    // let destAddress = getContractAddress(Contract);
    let destAddress = CONTRACT_ADDRESS;
    let constantObj = await getWrappedConstant("IdOf", [], destAddress, account);
    return constantObj;
}

