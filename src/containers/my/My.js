/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './my.scss';
import {Link, withRouter} from "react-router-dom";
import {instance} from '../../config/axiosConfig';
import {connect} from "react-redux";
import Cookies from 'js-cookie';
import {confirm_address_state, logID, saveUserName} from "../../redux/actions";

const user = {
    avatar: require('../../images/02.png'),
    name: "云棠",
    status: "/版本0.11/",
    id: "2"
};

const TestData = {
    choosen: 12,
    publish: 30,
    reward: 60
};

@withRouter
@connect(
    state => state.user,
    {logID, confirm_address_state, saveUserName}
)
class My extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ID: 0,
            user: null
        }
    }


    componentWillMount() {
        Cookies.remove("url");
        let {id} = this.props;
        this.setState({
            ID: id || Cookies.get('ID') || 1 // 测试
        },()=>{
            this.props.logID(this.state.ID);
             instance.get(`/my/getHome?ID=${this.state.ID}`).then((res)=>{
                 let user = {
                        avatar: res.data[0].figureurl,
                        name: res.data[0].nickname,
                        status: "/版本0.1/",
                    };
                    this.setState({
                        user: user
                    },()=>{
                            this.props.saveUserName(res.data[0].nickname);
                            instance.post('/my/getWalletInfo' ,{ID: this.props.id}).then((res)=>{
                                if(res.data.ans && res.data.ans === 'error') {
                                    console.log("读取信息错误");
                                } else {
                                    this.props.confirm_address_state(res.data.address && res.data.address !== "");
                                }
                            })
                    })
                })
            });
    }

    render() {
        let user = this.state.user;
        return this.state.user ? (
            <div className={style.main}>
                <div className={style.info}>
                    <div className={style.detail}>
                    <div className={style.avatar}>
                        <img src={user.avatar} alt="avatar"/>
                    </div>
                    <div className={style.infoDetail}>
                        <div className={style.userName}>
                            <span>{user.name}</span>
                            <span className={style.level}>{user.level || "LV.1"}</span>
                        </div>
                        <div className={style.status}>
                            <Link to={`/UserInfo/${user.id}`}><img src={require('../../images/rightBack.png')} alt="back"/></Link>
                        </div>
                    </div>
                    </div>
                    <div className={style.data}>
                        <div><span className={style.number}>{TestData.choosen}</span><span>被采纳</span></div>
                        <div><span className={style.number}>{TestData.publish}</span><span>发布</span></div>
                        <div><span className={style.number}>{TestData.reward}<span>币</span></span><span>奖励</span></div>
                    </div>
                </div>
                <div className={style.nav}>
                    <div className={style.upper}>
                        <div className={style.navItem}>
                            <img src={require(`../../images/wallet.png`)} alt=""/>
                            <Link className={style.navLink} to={`/wallet/${user.id}`}>钱包</Link>
                        </div>
                    {/*</div>*/}
                    {/*<div className={style.bottom}>*/}
                        <div className={style.navItem}>
                            <img src={require('../../images/attach.png')} alt=""/>
                            <Link className={style.navLink} to={`/tags/${user.id}`}>标签</Link>
                        </div>
                        <div className={style.navItem}>
                            <img src={require('../../images/friends.png')} alt=""/>
                            好友
                        </div>
                        <div className={style.navItem}>
                            <img src={require('../../images/msg.png')} alt=""/>
                            通知
                        </div>
                    </div>
                </div>
            </div>) : "";
    }
}


export default My;
