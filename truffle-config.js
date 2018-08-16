const {WEB3_PORT, WEB3_URL} = require("./web3Config");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: WEB3_URL, //本地地址，因为是在本机上建立的节点
      port: WEB3_PORT,        //Ethereum的rpc监听的端口号，默认是8545
      network_id: "*",    // 自定义网络号
      gas: 5000000
    }
  }
};
