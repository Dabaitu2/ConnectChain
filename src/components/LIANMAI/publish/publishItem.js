/**
 *    Created by tomokokawase
 *    On 2018/7/25
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './publishItem.scss';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {log_status} from "../../../redux/actions";


const srcList  = [
    require("../../../images/success.png"),
    require("../../../images/inProgress.png"),
    require("../../../images/failed.png"),
    require("../../../images/warning.png")
];

@withRouter
@connect(
    state => state.user,
    {log_status}
)
class PublishItem extends Component {
    constructor(props) {
        super(props);
        this.event = null;
    }

    render() {
        const {info} = this.props;
        const status = info.status;
        let timePieces = info.time.split('T')[0].split('-');
        let rawTime = timePieces[1]+"月"+timePieces[2]+"日";
        let src = null;
        switch (status) {
            case 2:
                src = srcList[0];
                break;
            case 1:
                src = srcList[1];
                break;
            case 0:
                src = srcList[2];
                break;
            default:
                src = srcList[3];
                break;
        }
        return (
            <div className={style.item}
                 onClick={()=>{
                     this.props.log_status(info.status);
                     this.props.history.push(`/questionDetail/${info.id}`)
                 }}

            >
                <div className={style.left}>
                    <img src={src} alt="status"/>
                    <h4>{info.title}</h4>
                </div>
                <div className={style.assistList}>
                        <span>回答{info.answer}次</span>
                        <span>转发{info.transferNum}次</span>
                        <span>发布于{rawTime}</span>
                    </div>
                </div>

        );
    }
}


export default PublishItem;
