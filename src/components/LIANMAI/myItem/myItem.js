/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './myItem.scss';
import {formatMMDD, SecondToDate} from "../../../utils/dates";

class MyItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info : this.props.info,
            img: this.props.img
        }
    }


    componentWillMount() {
        this.setState({
            info: this.props.info,
            img: this.props.img
        })
    }


    judge = (type) => {
        switch (type) {
            case "publish":
                return "发布了";
            case "response" :
                return "回答了";
            case "transfer":
                return "转发了";
            default:
                return "信息出错了"
        }

    };


    render() {
        let info = this.state.info;
        return (
            <div className={style.main}>
                <div className={style.head}>
                    <div className={style.avatar}>
                        <img
                            src={this.props.img}
                            alt="avatar"/>
                    </div>
                    <div className={style.assist}>
                        <span className={style.nameInfo}>{this.props.name}{this.judge(info.type)}</span>
                        <span className={style.dateInfo}>
                            <span className={style.hint} />
                            {/*尝试在父组件中先行转换，但是发生内存泄漏失败*/}
                            {formatMMDD(info.timeStamp)}
                        </span>
                    </div>
                </div>
                <div className={style.content}>
                    {info.details}
                </div>
                <div className={style.bottom}>
                    {info.type === "publish" ? <div>
                        <span><img src={require('../../../images/answerTip.png')}/>{info.answer}</span>
                        <span><img src={require('../../../images/transfer.jpg')}/>{info.transfer}</span>
                    </div> : <div className={style.withCalendar}>
                        <span>
                            <img src={require('../../../images/calendar.png')} alt="canlendar"/>
                            {info.finishedTime == 0 ? "已结束" : "还剩"+SecondToDate(info.finishedTime)}
                        </span>
                    </div>}
                </div>
            </div>
        );
    }
}


export default MyItem;
