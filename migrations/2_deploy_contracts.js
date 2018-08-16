var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Voting = artifacts.require("./Voting.sol");
var EcommerceStore = artifacts.require("./EcommerceStore.sol");
var OurCoins = artifacts.require("./OurCoins.sol");


module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Voting, 10000, web3.toWei('0.01', 'ether'), ["Amy", "Bob", "Sam"]);
  deployer.deploy(OurCoins, 10000000000, web3.toWei('0.0005', 'ether'), "0x1edc855f7afc87ad1b0455d8c49ec3abc96196e0");
  deployer.deploy(EcommerceStore);
};
