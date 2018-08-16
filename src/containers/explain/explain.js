/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './explain.scss';
import {withRouter} from "react-router-dom";


@withRouter
class Explain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id : this.props.id
        }
    }

    render() {
        return (
            <div className={style.main}>
                <div className={style.head}>
                    <h2>
                        <img src={require('../../images/why.png')} className={style.why}/>为什么要绑定私钥?</h2>
                    <div>
                        {/*todo 在智能合约里面定权*/}
                        {/*在这里也可以直接输入支付密码*/}
                        链脉是基于以太坊的去中心化应用，它的取现，充值等资金流转功能都是
                        基于智能合约实现的，在产品种交易使用的M币是基于以太币作为发行单位。
                        因而您需要一个以太坊地址来接受资金。
                    </div>
                    <div>
                        本产品已经内置了一个去中心化的以太坊钱包。
                        您可以通过设置自己的支付密码来获取一个标准以太坊格式的加密文件，
                        今后，您可以只凭输入支付密码即可获得私钥，进行提现，充值或者授权本产品进行其他操作。
                    </div>
                    <div>
                        您可以在下方直接绑定您的账户，输入您设定的支付密码即可！
                    </div>
                </div>
                <div className={style.InputGroup}>
                    <input type="password" placeholder={"请输入您的密码"}/>
                    <input type="password" placeholder={"请确认您的密码"}/>
                    <div className={style.btnGroup}>
                    <span
                        onTouchStart={()=>{
                    //    TODO 先调用web3 再发送ajax
                    }}>现在绑定</span>
                    <span
                        style={{
                            color: "#a7a7a7"
                        }}
                        onTouchStart={()=>{
                            this.props.history.goBack();
                        }}>或者返回</span></div>
                </div>
            </div>
        );
    }
}


export default Explain;
