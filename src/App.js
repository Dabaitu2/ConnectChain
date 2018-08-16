import React, {Component} from 'react'

import './global.scss'
import './App.css'

import {HashRouter, Link, Route, Switch, BrowserRouter} from 'react-router-dom'
import Index from "./containers/Index/Index";
import Shops from "./containers/shops/Shops";
import getWeb3 from './utils/getWeb3'

import {init_web3} from "./redux/actions";
import {init_contract_instance} from "./redux/actions";

import io from 'socket.io-client';
import {connect} from "react-redux";
import NewQuestion from "./containers/newQuestion/NewQuestion";
import QuestionDetail from "./containers/questionDetail/QuestionDetail";
import {CSSTransitionGroup} from "react-transition-group";
import Chat from "./containers/Chat/Chat";
import center from "./containers/center/center";
import ERROR from "./containers/ERROR/ERROR";
import style from './containers/center/center.scss'
import UserInfo from "./containers/UserInfo/UserInfo";
import Wallet from "./containers/wallet/wallet";
import Tags from "./containers/tags/tags";
import Explain from "./containers/explain/explain";
import Share from "./containers/share/share";
import Login from "./containers/Login/Login";
import Jump from "./containers/jump/jump";
import {getWeb3ContractInstance} from "./contractTools/tools";

import OurCoinsContract from './contracts/OurCoins.json';
import OtherViewDetail from "./containers/questionDetail/OtherViewDetail";

export const socket = io('ws://www.uchuangbang.com:80');


const navInfo = [
    {
        img: "park",
        tips: "广场",
    },
    {
        img: "pace",
        tips: "足迹",
    },
    {
        img: "my",
        tips: "我的",
    },
];

@connect(
    state => state.user,
    {init_web3, init_contract_instance}
)
class App extends Component {

    constructor(props) {
        super(props);

    }


    componentWillMount() {
        getWeb3
            .then(results => {
                this.props.init_web3(results.web3);
                console.log("web3部署完成");
                this.props.init_contract_instance(getWeb3ContractInstance(OurCoinsContract, results.web3));
                console.log("合约实例部署完成");
            })
            .catch((err) => {
                console.log('Error finding web3.')
            });
        socket.on('sendMessage', (data) => {
            console.log(data);
        });

    }


    componentWillReceiveProps(nextProps) {
        // 开启聊天socket的全局监听
        if('id' in nextProps && this.props.id != nextProps.id) {
            socket.emit('addUser', this.props.id);
        }
    }


    returnActive  = (location, img, tips) => {
        let Imgchild =  location.pathname.indexOf(img) > -1 ?
            <img src={require(`./images/${img}-active.png`)} alt={tips}/> :
            <img src={require(`./images/${img}.png`)} alt={tips}/>;

        let textChild = location.pathname.indexOf(img) > -1 ?
            <span className = {style.active}>{tips}</span>:
            <span>{tips}</span>;

            return (<Link
                key={tips}
                className={style.linkItem} to={`/center/${img}`}>
                {Imgchild}
                {textChild}
            </Link>)
        };


    render() {
        return (
            <BrowserRouter>
                {this.props.web3 ? (<div>
                    <Route render={({location}) => {
                        return (
                            <div className={`default-bg App`}>
                                <CSSTransitionGroup
                                    transitionName={'fade'}
                                    transitionEnterTimeout={310}
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        display: "block"
                                    }}
                                    transitionLeaveTimeout={300}>
                                    <Switch key={location.pathname} location={location}>
                                        {/*<Route component={Shops} path="/shops"/>*/}
                                        {/*<Route component={Index} path="/Index"/>*/}
                                        <Route component={Login} path="/Index"/>
                                        <Route component={NewQuestion} path="/newQuestion"/>
                                        <Route component={QuestionDetail} path="/questionDetail/:id"/>
                                        <Route component={OtherViewDetail} path="/otherViewDetail/:id"/>
                                        <Route component={Chat} path="/Chat"/>
                                        <Route component={center} path='/center'/>
                                        <Route component={UserInfo} path='/UserInfo/:id'/>
                                        <Route component={Wallet} path='/wallet'/>
                                        <Route component={Tags} path='/tags/:id'/>
                                        <Route component={Explain} path='/explain/:id'/>
                                        <Route component={Share} path='/share'/>
                                        <Route component={Jump} path='/jump'/>
                                        <Route component={Index} path='/test'/>
                                        <Route component={ERROR}/>
                                    </Switch>
                                </CSSTransitionGroup>
                                {/*TODO 这边写的也很烂，但是我还没找到使子路由摆脱CSSTrasitionGroup的方法*/}
                                <div
                                    style={{
                                        display: location.pathname.indexOf("center") > -1 ?
                                            "block" :
                                            "none"
                                    }}
                                >
                                    <div className={style.navBar}>
                                        {navInfo.map(v => {
                                            return this.returnActive(location, v.img, v.tips)
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    }}>
                    </Route>
                </div>) : <div>网页加载中，请稍等</div>}
            </BrowserRouter>
        )
    }
}

export default App
