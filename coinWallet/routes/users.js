const EcommerceStoreContract = require("../Utils/Contracts").EcommerceStoreContract;
const SimpleStorageContract  = require("../Utils/Contracts").SimpleStorageContract;

var express     = require('express');
var router      = express.Router();
var getWeb3     = require('../public/javascripts/getWeb3');
var getStores   = require('../Utils/Contracts').getStores;
const contract  = require('truffle-contract');


var web3 = getWeb3();
const EcommerceStore = contract(EcommerceStoreContract);
EcommerceStore.setNetwork(5777);
EcommerceStore.setProvider(web3.currentProvider);



router.get('/', function (req, res, next) {
    if(web3) {
        res.json({ans: "以太坊节点运作正常"})
    } else {
        res.json({error: "以太坊节点故障! 请联系管理员"})
    }
});

router.get('/account', function (req, res, next) {
    if(web3) {
        web3.eth.getAccounts(((error, accounts) => {
            return EcommerceStore.deployed()
                .then((inst)=>{
                    getStores(inst);
                    res.json({account:accounts[0]});
                }).catch((err)=>{
                    console.log("ERR: "+err.message);
                })
        }))
    } else {
        res.json({error: "以太坊节点故障! 请联系管理员"})
    }
});

router.post("/tryTrade", function (req, res, next) {
    if(web3) {
        let serializedTx = req.body.Tx;
        console.log(serializedTx);
        try {
            web3.eth.sendSignedTransaction(serializedTx).on('receipt', () => {
                console.log("成功!");
                res.json({ans: "success"})
            });
        } catch (err) {
            console.log(err);
            res.json({ans: "failed"})
        }
    } else {
        res.json({error: "以太坊节点故障! 请联系管理员"})
    }
});

router.post("/tryCall", function (req, res, next) {
    let constantObj = req.body;
    let {contractAddress, methodName, account, parameters} = constantObj;
        let MyContract = new web3.eth.Contract(SimpleStorageContract.abi, contractAddress);
    try {
        let constantObj = MyContract.methods[methodName](...parameters);
        constantObj.call({
            from:account
        }).then(()=>{
            console.log("成功!");
            res.json({ans:"success"})
        });
    } catch (err) {
        console.log(err);
        res.json({ans:"failed"})
    }
});

router.get("/getGasPrice", function (req, res, next) {
   web3.eth.getGasPrice().then((v)=>{
       res.json({
           price: web3.utils.toHex(v)
       })
   })
});


router.post('/getBalance', function (req, res, next) {
    web3.eth.getBalance(req.body.address, function(err,result) {
        if (err == null) {
            console.log('~balance:'+result);
            res.json(result);
        }else {
            console.log('~error:'+err);
            res.json(err);
        }
    });
});

module.exports = router;
