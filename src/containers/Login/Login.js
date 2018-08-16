/**
 *    Created by tomokokawase
 *    On 2018/7/29
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './login.scss';
import {instance} from '../../config/axiosConfig';

const ImgList = [
    require(`../../images/QQ.png`),
    require('../../images/wechat.png')
];

const ActiveImgList = [
    require(`../../images/QQ_active.png`),
    require('../../images/wechat_active.png')
];


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            propgate: [],
            now: 0,
            wechat: ImgList[0],
            QQ: ImgList[1],
        };
        this.changeTips = null;
    }


    componentWillMount() {
        // TODO 进来之前先判断sessionID,有就直接跳回主页
        // this.handleCheck();
        // instance.get('/login/saveUrl?url')
    }


    componentWillUnmount() {
        clearInterval(this.changeTips);
        this.changeTips = null;
    }

    handleCheck = () => {
        instance.get('/login/getStatus').then((res)=>{
            console.log(res);
            if (res.data.ans === "success") {
                this.props.history.push("/center/my");
            } else {
                return;
            }
        }).catch(err=> {
            console.log(err)
        })
    };


    render() {
        return (
            <div className={style.main}>
                {/*<h4 className={style.fadeIn}>问题高效解决</h4>*/}
                {/*<h4 className={style.fadeIn}>奖励合理分配</h4>*/}
                {/*<h4 className={style.fadeIn}>人脉紧密连接</h4>*/}
                <div className={style.btnGroup}>
                    <a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx29e7589528b1dc2f&redirect_uri=http%3a%2f%2fwww.uchuangbang.com%2flogin%2fwechatCallBack&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect">
                        <img src={require('../../images/wechat.jpg')} alt="wechat"/>
                        微信登陆
                    </a>
                </div>

            </div>
        );
    }
}


export default Login;

