/**
 *    Created by tomokokawase
 *    On 2018/7/18
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import Voting from "../../components/voting/voting";
import {SimpleStorageContract} from '../../utils/Contracts'
import getWeb3 from '../../utils/getWeb3'
import {connect} from "react-redux";
import {init_web3} from '../../redux/actions';
import axios from 'axios';
import {
    getGasPrice, getNonce, getBalance, generateAccount, getWeb3ContractInstance, WrapTrasaction, Trasaction,
    getLocalPrivateKey, getWrappedConstant, getContractAddress, generateOwnKeyStore
} from "../../contractTools/tools";


export const instance = axios.create({
    baseURL: 'http://localhost:3001'
});
const testPrivateKey = '6cbccff130e3c70fdfe664f7d6facc3d44abb4b73a60dc29c306b8a3c18d0567';


@connect(
    state => state.user,
    {init_web3}
)
class Index extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            storageValue: 0,
            web3: this.props.web3,
            privateKey: '',
            newAddress: "",
            readPrivateKey: ""
        }
    }



    componentWillMount() {
        this.instantiateContract()
    }

    instantiateContract() {
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.setState({
                account: accounts[0]
            },()=>{
                this.testSubmit.bind(this)(2);
            })
        })
    }

    async getNewAccounts() {
        let account =  await generateAccount(this.state.web3);
        this.setState({
            newAddress: account.address,
            newPrivateKey: account.privateKey
        })
    }


    async testSubmit(setValue) {
        let {web3, account} = this.state;
        let simpleContract = getWeb3ContractInstance(SimpleStorageContract, web3);
        let privateKey = '6cbccff130e3c70fdfe664f7d6facc3d44abb4b73a60dc29c306b8a3c18d0567';
        let destAddress = getContractAddress(SimpleStorageContract);
        let serializedTx = await WrapTrasaction("set", [setValue], simpleContract, privateKey, account, destAddress, web3);
        console.log(serializedTx);
        axios.post('http://localhost:3001/users/tryTrade',{
            Tx: serializedTx
        }).then((res)=>{
            console.log(res);
            if(res.data.ans==="success") {
                this.setState({
                    storageValue: setValue
                })
            }
        }).catch((err)=>{
            console.log(err.messageData)
        })
    }

    async testNoTrasactionMethod (){
        let {account} = this.state;
        let destAddress    = getContractAddress(SimpleStorageContract);
        let constantObj = await getWrappedConstant("get", [], destAddress, account);
        console.log(constantObj);
        axios.post('http://localhost:3001/users/tryCall',constantObj).then((res)=>{
            console.log(res);
            if(res.data.ans==="success") {
               console.log("get 成功了哈!")
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    async send1ETH() {
        let {web3, account} = this.state;
        let privateKey = '6cbccff130e3c70fdfe664f7d6facc3d44abb4b73a60dc29c306b8a3c18d0567';
        let destAddress = '0xf76c27c1c537934b67032dcf07a9d7597b028e8a';
        let value = web3.utils.toWei(1+"", 'ether');
        let serializedTx = await Trasaction(privateKey, account, destAddress, value, web3);
        instance.post("/users/tryTrade", {
            Tx: serializedTx
        }).then((res)=>{
            console.log(res);
            if(res.data.ans==="success") {
                alert("转账成功了哈!");
            }
        }).catch((err)=>{
            console.log(err.messageData)
        })

    }

    render() {
        return this.state.web3 ? (
            <div className="App">
                <nav className="navbar pure-menu pure-menu-horizontal">
                    <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
                </nav>

                <main className="container">
                    <div className="pure-g">
                        <div className="pure-u-1-1">
                            <h1>Good to Go!</h1>
                            <p>Your Truffle Box is installed and ready.</p>
                            <h2>Smart Contract Example</h2>
                            <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
                            <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
                            <p>The stored value is: {this.state.storageValue}</p>
                        </div>
                    </div>
                    <h3>获取到的新地址: {this.state.newAddress}</h3>
                    <h3>获取到的新私钥: {this.state.newPrivateKey}</h3>
                    <h3>本地获取到的私钥: {this.state.readPrivateKey}</h3>
                    <input type="submit"
                           value={"通过智能合约+后台钱包修改数据"}
                           onClick={(e)=>{
                        e.preventDefault();

                        this.testSubmit.bind(this)(150);

                    }}/>
                    <input type="submit"
                           value={"发起一个constant交易"}
                           onClick={(e)=>{
                               e.preventDefault();
                               this.testNoTrasactionMethod.bind(this)();
                           }}/>
                    <input type="submit"
                           value={"尝试发起一笔1ETH的交易"}
                           onClick={(e)=>{
                               e.preventDefault();
                               this.send1ETH.bind(this)();
                           }}/>
                    <input type="submit"
                           value={"生成一对密钥和地址"}
                           onClick={(e)=>{
                        e.preventDefault();
                        this.getNewAccounts.bind(this)();
                    }}/>
                    <input type="submit"
                           value={"保存当前私钥keyStore到localStorage"}
                           onClick={(e)=>{
                               e.preventDefault();
                               console.log(generateOwnKeyStore(this.state.web3, testPrivateKey, "123456", "tom"));
                           }}/>
                    <input type="submit"
                           value={"授权读取localStorage中的当前私钥keyStore"}
                           onClick={(e)=>{
                               e.preventDefault();
                               getLocalPrivateKey(this.state.web3, "123456", "tom").then(
                                   (v)=>{
                                       this.setState({
                                           readPrivateKey:v.privateKey
                                       })
                                   }
                               );
                           }}/>
                    <Voting web3={this.state.web3}/>
                </main>
            </div>
        ) : <div />
    }
}


export default Index;
