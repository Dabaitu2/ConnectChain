const EcommerceStore = artifacts.require("./EcommerceStore.sol");
const Eutil	= require('ethereumjs-util');


//金额单位换算：ether -> wei
const amt_1 = web3.toWei(1, 'ether');
let inst = null;
let lastid = 0;

function bid(productId, payment, unit, _secret, id) {
	let sealBid = "0x" + Eutil.sha3((payment * unit) + _secret).toString('hex');
	inst.bid(productId, sealBid, {
		value: payment * unit,
		from: web3.eth.accounts[id]
	}).then(function(f){
		console.log(f);
	})
}

// 调用传入的callback参数来通知truffle执行结束或发生错误需要终止。
// callback()接收一个 表征错误的参数，
// 如果该参数非空，则truffle将立即停止执行并返回一个非零的退出码。

module.exports = function(callback){

//时间单位换算：毫秒 -> 秒
	let current_time = Math.round(new Date() / 1000);

	EcommerceStore.deployed() //获取电商合约实例
  		.then(i => {
		//添加商品
		inst = i;
		inst.addProductToStore('东北无机大米', '纯正东北大米,好吃!', 'imagelink', 
					'desclink', current_time, current_time + 50, amt_1, 0)
	  		.then(()=> inst.productIndex()) //获取商品计数器当前值
	  		.then(id => {
				 lastid = id;
				 return inst.getProduct(lastid);
				}) //获取最后添加的商品信息
			.then(product => console.log(product))  //输出商品信息
			.then(() => {
				bid(lastid, 2, amt_1, "salalala", 1);
				bid(lastid, 3, amt_1, "lasasasa", 2);				
			})
  	});  
}




