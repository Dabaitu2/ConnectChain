/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './transfer.scss';
import {withRouter} from "react-router-dom";


const srcList  = [
    require("../../../images/01.jpg"),
    require("../../../images/02.png"),
    require("../../../images/03.jpg")
];

const statusList = [
    require("../../../images/finished.png"),
    require("../../../images/inProgress.png"),
    require("../../../images/close.png"),
    require("../../../images/warning.png")
];

@withRouter
class TransferItem extends Component {
    constructor(props) {
        super(props);
        this.event = null;
    }

    render() {
        const {info} = this.props;
        const id = info.id;
        let src = srcList[id];
        let status = info.status;
        let statusSrc;
        switch (status) {
            case "success":
                statusSrc = statusList[0];
                break;
            case "inProgress":
                statusSrc = statusList[1];
                break;
            case "failed":
                statusSrc = statusList[2];
                break;
            default:
                statusSrc = statusList[3];
                break;
        }
        return (
            <div className={style.item}
                 // onClick={()=>{
                 //     this.props.history.go(info.link);
                 // }}
            >
                <h4>{info.title}</h4>
                <div className={style.assistList}>
                <div className={style.left}>
                    <div className={style.wrapper}>
                        <img src={info.imgUrl}
                             className={style.avatar}
                             alt="logo"/>
                    </div>
                    <span>{info.username}</span>
                </div>
                    <img src={statusSrc} alt="logo"/>
                </div>
            </div>
        );
    }
}


export default TransferItem;
