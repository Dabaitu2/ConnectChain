import Web3 from 'web3'
// var ganache_provider = require("ganache-cli/lib").provider();
import {WEB3_PORT, WEB3_PROTOCAL, WEB3_URL} from "../config/web3Config";


// 这里导入的web3和truffle实际上是分开用的，用于做getAccounts之类的操作

let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results
    var web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = {
        web3: web3
      }

      console.log('Injected web3 detected.');

      resolve(results)
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      // 在客户端的web3还是需要连接到远端节点的，但是代码中不写任何关于远端节点的交易代码。
      // 可以连入测试节点，用来计算gas相关的属性,或者连入infra?
      var provider = new Web3.providers.HttpProvider(`${WEB3_PROTOCAL}://${WEB3_URL}:${WEB3_PORT}`);

      web3 = new Web3();
      // web3.setProvider(ganache_provider);
      web3.setProvider(provider);

      results = {
        web3: web3
      };

      console.log('连接到本地以太坊节点!');
      window.web3 = web3;

      resolve(results)
    }
  })
});

export default getWeb3
