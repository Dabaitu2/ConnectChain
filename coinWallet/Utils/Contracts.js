/**
 *    Created by tomokokawase
 *    On 2018/7/20
 *    阿弥陀佛，没有bug!
 */
const SimpleStorageContract = require('../build/contracts/SimpleStorage.json');
const VotingContract = require('../build/contracts/Voting.json');
const EcommerceStoreContract = require('../build/contracts/EcommerceStore.json');
const OurCoins = require('../build/contracts/OurCoins.json');


function getSingleStore(id ,Instance) {
    return new Promise((resolve) => {
        Instance.getProduct.call(id)
            .then((v)=>{
                resolve(v);
            });
    });
};

const getStores = (Instance) => {
    let taskList = [];
    let newStores = [];
    Instance.productIndex()
        .then((len)=>{
            console.log(len);
            for (let id=1; id<=len["c"][0]; id++) {
                taskList.push(getSingleStore(id, Instance))
            }
            Promise.all(taskList).then(res => {
                newStores = res;
                console.log(res);
            });
        })
};


module.exports = {
    SimpleStorageContract : SimpleStorageContract,
    VotingContract : VotingContract,
    EcommerceStoreContract : EcommerceStoreContract,
    OurCoinsContract: OurCoins,
    getStores: getStores
};