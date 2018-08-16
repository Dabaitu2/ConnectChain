/**
 *    Created by tomokokawase
 *    On 2018/7/24
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './rsItem.scss';
import HOC_Form from "../../HOC_Form/HOC_Form";
import {SecondToDate, transferTZ} from "../../../utils/dates";
import {withRouter} from "react-router-dom";
const srcList      = [
    require("../../../images/finished.png"),
    require("../../../images/Active.png")
];

@withRouter
@HOC_Form
export default class ResponseItem extends Component {
    render() {
        const {info} = this.props;
        let lastChat = info.lastChat.detail;
        let abstract = lastChat.length > 18 ?
                        info.lastChat.detail.substring(0, 20)+"..." :
                        info.lastChat.detail;
        let lastTime = (transferTZ(info.endTime) - new Date().getTime())/1000;
            lastTime = lastTime > 0 ? SecondToDate(lastTime) : "0天" ;
        let chatTime = SecondToDate((new Date().getTime() - info.lastChatTime)/1000);
        let src      = !info.noFinished ? srcList[0] : srcList[1];
        let tips     = !info.noFinished ? "已完成" : `还剩${lastTime}`;

        return (
            <div className={style.item}
                 onClick={()=>{
                     this.props.history.push({
                         pathname: `/Chat`,
                         query: {
                             dialogueID: info.dialogueID
                         }
                     });
                 }}
            >
                <h4>{info.title}</h4>
                <h5>{`${info.lastChat.user}: ${abstract}`}</h5>
                <div>
                    {info.hasNews ? <span className={style.newsDot} /> : ""}
                    <span className={style.timeContainer}>
                        <span className={style.timeInfo} >
                            <img src={require("../../../images/mcoin.jpg")}
                                 alt="mcoin"/>{info.token}
                        </span>
                        <span className={style.timeInfo} >
                            <img className={style.status} src={require("../../../images/time.png")} alt="Finishedlogo"/>
                            {tips}
                        </span>
                    </span>
                </div>
            </div>
        );
    }

}