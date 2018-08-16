/**
 *   Created by tomokokawase
 *   On 2018/7/21
 *   阿弥陀佛，没有bug!
 *
 *   ContractTools
 *
 *   用来跟远程钱包发生数据调用以及获取本地合约的一些接口方法
 *   其中涉及交易的方法都是在本地使用私钥签名后再发送的
 *   由于为了实现绕开第三方钱包直接与节点通信，使用了web3@1.0.0-beta34
 *   但是web3依然需要provider，所以必须连接一个以太坊节点
 *   不过可以是无害的测试网络节点例如Infra而非真实的以太坊节点
 *
 *   为什么要绕开第三方钱包节点? => 因为这样不可控,同时要求用户必须使用第三方插件
 * */

/**
 * 获取区块链上的油资
 * @return price 返回的Gas值
 * */
import {instance} from '../config/axiosConfig'
import ToastBox from "../components/LIANMAI/Toast/index";
export async function getGasPrice()  {
    let price = await instance.get("/eth/getGasPrice");
    return price.data.price;
}

/**
 * 查询当前节点，当前地址下用户的交易数
 * @param  {string}     sendAddress  发送者的地址
 * @param  {object}     web3         需要调用的RPC库
 * @return              nonce        用户在当前节点上的交易数(叠加值)
 * */
export async function getNonce(sendAddress, web3) {
    console.log("尝试获取nonce");
    return await web3.eth.getTransactionCount(sendAddress);
}

/**
 * 查询相关地址的以太币余额
 * @param  {string}     address   查询的地址
 * @return {promise}    balance   查询地址的以太坊余额
 * */
export async function getBalance(address) {
    return await instance.post("/eth/getBalance", {address});
}
/**
 * 生成一对可以作为账号的公私钥数据
 * @param  {object}     web3         需要调用的RPC库
 * @return {object}     accountsObj  一个由web3创建的密钥和地址的对象
 * */
//TODO 公钥，地址和用户的账号形成映射关系
export async function generateAccount(web3) {
    return await web3.eth.accounts.create();
}
/**
 * 获取用户合约的地址
 * @param   {object}    contract    编译后的json格式合约
 * @return  {string}    address     当前合约部署的地址
 * */
export function getContractAddress(contract) {
    let nowId = Object.keys(contract.networks).length-1;
    return contract.networks[Object.keys(contract.networks)[nowId]].address;
}
/**
 * 从truffle编译的合约json数据中获取web3的智能合约实例
 * @param   {object}    contract    编译后的json格式合约
 * @param   {object}    web3        需要使用的RPC库
 * @return  Contract     返回一个智能合约实例
 * 注意，本地实例和服务器合约对象应该保持一致，否则需要更新代码，
 * 智能合约应该先部署了再发布网页
 * */
export function getWeb3ContractInstance(contract, web3) {
    let abi = contract.abi;
    let address = getContractAddress(contract);
    return new web3.eth.Contract(abi, address);
}
/**
 * 生成call constant合约对象的条件对象,他们被发送到后端帮忙进行call调用RPC节点查询
 * contract也使用约地址，减少运输损耗同时避免传输过程中的信息丢失
 * @param   {string}    methodName      调用的方法名
 * @param   {Array}     parameters      方法所需要的参数数组
 * @param   {string}    contractAddress 合约的地址
 * @param   {string}    address         用户的地址
 * */
export function getWrappedConstant(methodName, parameters, contractAddress, address) {
    return {
        methodName,
        parameters,
        contractAddress,
        address
    }
}
/**
 * 生成离线签名的合约生成交易，这个交易绕开了第三方钱包，而直接发给了我们作为以太坊节点的服务器
 * 大致流程为 客户端(自己存有私钥和合约json文件)使用web3包装合约为RawTx, 将其本地签名后再发给我们的远程服务器
 * 大致流程为 客户端(自己存有私钥和合约json文件)使用web3包装合约为RawTx, 将其本地签名后再发给我们的远程服务器
 * 这样就不需要再手机或者电脑上安装第三方钱包插件了，不过，私钥的输入依然是一个问题。当前localStorage安全性存疑
 * @param {string}      methodName  合约的方法名
 * @param {[]}          parameters  合约的参数数组
 * @param {Contract}    contract    合约的实例对象
 * @param {string}      privateKey  用户的私钥
 * @param {string}      account     用户的地址
 * @param {string}      toAddress   交易的地址，合约地址或者是直接转账的地址
 * @param {object}      web3        导入的RPC库
 * */
//TODO 找到合理，不损伤用户体验的方式来提供交易签名
export async function WrapTrasaction(methodName, parameters, contract, privateKey, account, toAddress, web3) {
    let TxObj       = contract.methods[methodName](...parameters);
    let data        = TxObj.encodeABI();
    let price       = await getGasPrice();

    // 需要连接以太坊网络计算的交给服务器
    let ans         = await instance.post('/eth/estimateGas',{methodName: methodName, parameters: parameters});
    let pregas      = ans.data.gas;
    console.log("是否进行到这一步: estimateGas?");

    // let pre_nonce   = await getNonce(account, web3);
    let nonce_ans   = await instance.post('/eth/getNonce', {address: account});
    let pre_nonce   = nonce_ans.data.nonce;
    console.log("是否进行到这一步: Nonce?");
    let gas         = web3.utils.toHex(+pregas*(6) > 500000 ? 500000 : +pregas*(6));
    let nonce       = web3.utils.toHex(pre_nonce);

    let Tx      = require('ethereumjs-tx');
    console.log("是否进行到这一步： 转化gas和nonce完成?");
    // 这一步就可以在智能合约那里确定msg.sender
    let Key     = new Buffer(privateKey.split('0x')[1], 'hex');
    console.log("是否进行到这一步： 转化私钥完成?");
    console.log(Key);
    let rawTx   = {
        nonce   : nonce,
        gasPrice: price,
        gasLimit: gas,
        to      : toAddress,
        value   : '0x00',
        data    : data
    };

    let tx = new Tx(rawTx);
    tx.sign(Key);
    console.log("是否进行到这一步： 签名完成?");

    let serializedTx = tx.serialize();
        serializedTx = '0x'+serializedTx.toString('hex');
    return serializedTx;
}
/**
 * 给buy方法写的mixin...更改合约太麻烦了
 * 算了还是改合约吧..
 * */
export async function WrapBuyTrasaction(methodName, parameters, contract, privateKey, account, toAddress, web3, numBerInWei) {
    let TxObj       = contract.methods[methodName](...parameters);
    let data        = TxObj.encodeABI();
    let price       = await getGasPrice();

    // 需要连接以太坊网络计算的交给服务器
    console.log(numBerInWei.toString());

    let ans         = await instance.post('/eth/estimateGas',{methodName: methodName, parameters: parameters, value:web3.utils.toHex(numBerInWei)});
    let pregas      = ans.data.gas;
    console.log(ans);
    let nonce_ans   = await instance.post('/eth/getNonce', {address: account});
    let pre_nonce   = nonce_ans.data.nonce;
    let gas         = web3.utils.toHex(+pregas*2);
    let nonce       = web3.utils.toHex(pre_nonce);

    let Tx      = require('ethereumjs-tx');
    console.log("是否进行到这一步： 转化gas和nonce完成?");
    // 这一步就可以在智能合约那里确定msg.sender
    let Key     = new Buffer(privateKey.split('0x')[1], 'hex');
    console.log("是否进行到这一步： 转化私钥完成?");
    console.log(Key);
    console.log(numBerInWei);
    let rawTx   = {
        from    : account,
        nonce   : nonce,
        gasPrice: price,
        gasLimit: gas,
        to      : toAddress,
        value   : web3.utils.toHex(numBerInWei),
        data    : data
    };

    let tx = new Tx(rawTx);
    tx.sign(Key);
    console.log("是否进行到这一步： 签名完成?");

    let serializedTx = tx.serialize();
    serializedTx = '0x'+serializedTx.toString('hex');
    return serializedTx;
}


/**
 * 获取纯转账过程的估计Gas消耗
 * @param   {string}            from     转账发起者
 * @param   {string}            to       转账接收者
 * @param   {string|number}     value    转账金额，单位为wei
 * @param   {object}            web3     RPC调用库
 * @return  {Promise<number>}   gas      预估的gas
 * */
export function estimateGas(from, to, value, web3) {
    return web3.eth.estimateGas({
        from    : from,
        to      : to,
        value   : value
    });
}
/**
 * 生成纯的以太坊转账交易，这个交易可以利用我们提供的钱包实现以太币转账
 * @param   {string}          privateKey  转账发起者的私钥
 * @param   {string}          account     转账发起者的地址
 * @param   {string}          toAddress   转账接收者的地址
 * @param   {string|number}   value       转账的金额,单位为wei
 * @param   {object}          web3        调用的RPC库
 * @return  {string}          serializeTx 序列化的交易对象
 * value, price, gas 需要保持一致的进制
 * */
export async function Trasaction(privateKey, account, toAddress, value, web3) {
    const price       = await getGasPrice();
    const ans         = await instance.post('/eth/estimateGas');
    const pregas      = ans.data.gas;
    const pre_nonce   = await getNonce(account, web3);
    const gas         = web3.utils.toHex(+pregas*1.2);
    const nonce       = web3.utils.toHex(pre_nonce);
          value       = web3.utils.toHex(value);

    let Tx      = require('ethereumjs-tx');
    let Key     = new Buffer(privateKey.split('0x')[1], 'hex');
    let rawTx   = {
        nonce   : nonce,
        gasPrice: price,
        gasLimit: gas,
        to      : toAddress,
        value   : value,
        data    : ""
    };

    let tx = new Tx(rawTx);
    tx.sign(Key);

    let serializedTx = tx.serialize();
    serializedTx = '0x'+serializedTx.toString('hex');
    return serializedTx;
}
/**
 * 生成可用的keyStore V3加密格式的私钥文件并存储到localStorage，
 * 以后用户就可以通过输入密码来解锁这个私钥，从而简化调用难度
 * @param   {object}    web3        调用的RPC库
 * @param   {string}    password    用户的密码，一定要妥善保存
 * @param   {string}    userId      用户的Id，用来对应唯一的keyStore 现在改变为用户的地址
 * @return  {boolean}   flag        判断是否存储成功,true为成功
 * */
export async function generateKeyStore(web3, password, userId) {
    let account  = await generateAccount(web3);
    console.log(account.address);
    let keyStore = web3.eth.accounts.encrypt(account.privateKey, password);
    keyStore = JSON.stringify(keyStore);
    localStorage.setItem(account.address, keyStore);
    return {
        status: "success",
        privateKey: account.privateKey,
        address: account.address
    };
}
/**
 * 用户导入私钥自己创建新的KeyStore文件并保存到本地
 * @param   {object}    web3        调用的RPC库
 * @param   {string}    privateKey  用户自己输入的私钥
 * @param   {string}    password    用户的密码，一定要妥善保存
 * @param   {string}    customId    用户自定义的Id(最好是地址)，用来对应唯一的keyStore
 * @return  {boolean}   flag        判断是否存储成功,true为成功
 * */
export function generateOwnKeyStore(web3, privateKey, password, customId) {
    let keyStore =  web3.eth.accounts.encrypt(privateKey, password);
    keyStore = JSON.stringify(keyStore);
    if(!localStorage.getItem(customId)) {
        try {
            localStorage.setItem(customId, keyStore);
            return {
                status: "success",
            };
        } catch (err) {
            ToastBox.error({
                content: "导入私钥出现问题!"
            });
            console.error("导入私钥出现问题: " + err);
        }
    } else {
        return false;
    }
}



/**
 * 获取用户的私钥 离线应该也能使用的方法(RN或者PWA)
 * 当然，用户也可以手动输入私钥而不是用KeyStore
 * @param   {object}    web3        调用的RPC库
 * @param   {string}    password    用户的密码，用来解锁keyStore
 * @param   {string}    userId      用户的Id, 用来对应唯一的keyStore
 * @param   {string}    address     用户的账户地址，今后应该使用它来作为key
 * @return  {object}    accountObj  返回的账户对象
 * */
export async function getLocalPrivateKey(web3, password, userId, address) {

    try {
        let keyStore = localStorage.getItem(userId);
        return web3.eth.accounts.decrypt(keyStore, password);
    } catch (err) {
        try {
            let keyStore = localStorage.getItem(address);
            return web3.eth.accounts.decrypt(keyStore, password);
        } catch (err) {
            console.warn(err);
        }
    }
}
