/**
 *    Created by tomokokawase
 *    On 2018/7/19
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import {EcommerceStoreContract} from "../../utils/Contracts";
import {init_web3} from "../../redux/actions";
import getWeb3 from '../../utils/getWeb3'
import './shops.scss'
import {Route, Switch, withRouter, Link} from "react-router-dom";
import AddProduct from "../../components/AddProduct/AddProduct";
import Details from "../../components/details/details";

@withRouter
@connect(
    state => state.user,
    {init_web3}
)
class Shops extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Instance: null,
            account: 0,
            web3: this.props.web3,
            storesList: []
        }
    }


    componentWillMount() {
        if (!this.props.web3) {
            getWeb3
                .then(results => {
                    this.setState({
                        web3: results.web3
                    }, ()=>{
                        this.props.init_web3(results.web3);
                    });

                    // Instantiate contract once web3 provided.
                    this.instantiateContract()
                })
                .catch(() => {
                    console.log('Error finding web3.')
                })
        } else {
            this.instantiateContract();
        }
    }

    async getSingleStore(id) {
        return await new Promise((resolve) => {
            this.state.Instance.getProduct.call(id)
                .then((v)=>{
                    resolve(v);
                });
        });
    };

    getStores = () => {
        let taskList = [];
        let newStores = [];
        this.state.Instance.productIndex()
            .then((len)=>{
                for (let id=1; id<=len["c"][0]; id++) {
                    taskList.push(this.getSingleStore.bind(this)(id))
                }
                Promise.all(taskList).then(res => {
                    newStores = res;
                    console.log(res);
                    this.setState({
                        storesList: newStores.slice(0)
                    });
                });
            })
    };


    instantiateContract = () => {
        const contract = require('truffle-contract');
        const EcommerceStore = contract(EcommerceStoreContract);
        EcommerceStore.setNetwork(5777);
        EcommerceStore.setProvider(this.state.web3.currentProvider);
        this.state.web3.eth.getAccounts((error, accounts) => {
            EcommerceStore.deployed().then((instance) => {
                console.log(instance);
                this.setState({
                    Instance: instance,
                    account: accounts[0],
                }, () => {
                    this.getStores();
                })
            });
        })
    };

    getProductStatus = (statusCode) => {
        switch (statusCode) {
            case 0:
                return "竞拍中";
            case 1:
                return "已售出";
            case 2:
                return "未售出";
            default:
                return "状态异常"
        }
    };

    getProductCondition = (Condition) => {
        switch (Condition) {
            case 0:
                return "新品";
            case 1:
                return "二手";
            default:
                return "状态异常"
        }
    };



    WelcomeComponent = function () {
      return (<h2>
          请点击左侧按钮进入表单页面
      </h2>)
    };

    handleChange = (key, value) => {
        this.setState({
            [key]: value
        })
    };


    render() {
        return (
            <div className={'shops-main'}>
                <div className="shops-left">
                    <h2>this is shop</h2>
                    <ul>
                        {this.state.storesList.length!==0 ? this.state.storesList.map((v, index)=>{
                                    return(<li key={v}>
                                        <h3>
                                            <Link to={`/shops/detail/${v[0]['c'][0]}`}>ID: {v[0]['c'][0]} 商品: {v[1]}</Link></h3>
                                        <span className={"shops-products-span"}>描述: {v[2]}</span>
                                        <span className={"shops-products-span"}>图片链接: {v[3]}</span>
                                        <span className={"shops-products-span"}>描述链接: {v[4]}</span>
                                        <span className={"shops-products-span"}>起拍时间: {v[5]["c"][0]}</span>
                                        <span className={"shops-products-span"}>结拍时间: {v[6]["c"][0]}</span>
                                        <span className={"shops-products-span"}>起拍价格: {v[7]["c"][0]}</span>
                                        <span className={"shops-products-span"}>当前状态: {this.getProductStatus(v[8]["c"][0])}</span>
                                        <span className={"shops-products-span"}>产品品相: {this.getProductCondition(v[9]["c"][0])}</span>
                                    </li>);
                            }) : ""
                        }
                    </ul>
                    <input type="submit" value="上传新商品" onClick={(e)=>{
                        e.preventDefault();
                        this.props.history.push("/shops/form");
                    }}/>
                </div>
                <div className={"shops-right"}>
                    <Switch>
                        <Route path={"/shops/form"} component={AddProduct}/>
                        <Route path={"/shops/detail/:id"} component={Details}/>
                        <Route component={this.WelcomeComponent} />
                    </Switch>
                </div>
            </div>
        );
    }
}


export default Shops;
