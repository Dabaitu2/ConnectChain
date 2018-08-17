/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './parkTransferItem.scss';
import {SecondToDateBlur} from "../../../utils/dates";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import ToastBox from "../Toast/index";
import {log_status, setOtherQuery} from "../../../redux/actions";

@withRouter
@connect(
    state => state.user,
    {log_status, setOtherQuery}
)
class ParkTransferItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: this.props.info,
            onFlat: false,
            originHeight: 0,
            ansQuery : {
                pathname: `/Chat`,
                query: {
                    questionID: this.props.info.questionID, //问题ID
                    answerer: this.props.id, // 回答者ID
                    quizzer: this.props.info.id, // 提问者ID
                    source: this.props.info.id // 只能看到一度人脉的提问或转发
                }
            },
            transferQuery: '/share?questionID=' + this.props.info.questionID + "&previousID=" + (this.props.info.previousID) + "&ID=" + this.props.id
        }
    }

    componentDidMount() {
        this.setState({
            originHeight: this.refs.content.offsetHeight,
            wrapperHeight: this.refs.wrapper.offsetHeight,
            headHeight: this.refs.head.offsetHeight
        });
    }


    transferTime = (DBtime) => {
        let day = DBtime.split('.')[0].split('T')[0];
        let time = DBtime.split('.')[0].split('T')[1];
        let combineTime = day + " " + time;
        let date = new Date(combineTime.replace(/-/g, '/'));
        return date.getTime();
    };

    handleShow = () => {
        this.setState({
            onFlat: !this.state.onFlat
        });
    };

    render() {
        let info = this.props.info;
        return (
            <div className={style.main}
                 onClick={()=>{
                     this.props.setOtherQuery({
                         tags: info.tags,
                         previousID: info.previousID,
                         transferQuery: this.state.transferQuery,
                         ansQuery: this.state.ansQuery
                     });
                     this.props.history.push({
                         pathname: `/otherViewDetail/${info.questionID}`,
                     })
                 }}
            >
                <div className={style.header}>
                    <div className={style.UserInfo}>
                        <div className={style.avatarInfo}>
                            <div className={style.avatar}>
                                <img src={info.imgUrl} alt="avatar"/>
                            </div>
                        </div>
                        <div className={style.detail}>
                            <div className={style.nameInfo}>
                                <span>{info.forwarderNickname}</span>
                                <span className={style.tips}>{SecondToDateBlur((new Date().getTime() - this.transferTime(info.time)) / 1000)}</span>
                            </div>
                            <div className={style.tags}>
                                <img src={require('../../../images/tag.png')} alt="tag"/>
                                <div className={style.tagsDetail}>
                                    {info.tags.map(v=>(
                                        <span key={v}>{v}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    ref={'wrapper'}
                    className={`
                            ${style.content}
                            ${this.state.onFlat ? "" : style.limitHeight}
                    `}
                    style={{
                        height: this.state.onFlat ? this.state.originHeight + 4 * 16 + "px" : "7rem"
                    }}
                >
                    <span className={style.origin}>{info.name}:</span>
                    <h3 ref={"head"}>{info.title}</h3>
                    <div
                        ref={'content'}
                        className={style.details}
                    >{info.details}</div>
                </div>
                {
                    this.state.originHeight > this.state.wrapperHeight - this.state.headHeight ?
                        <div className={style.seeAll}>查看全文</div> : ""
                }
                <div className={style.bottom}>
                    <span className={style.tips}>
                    <img
                        src={require("../../../images/mcoin.png")}
                        style={{
                            height: "1.2rem",
                            marginRight: "0.3rem"
                        }}
                        alt="mcoin"/> {info.reward}
                    </span>
                    <div className={style.btnGroup}>
                <span
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.history.push(this.state.ansQuery);
                    }}>
                        <img src={require('../../../images/toAns.jpg')}

                             alt="回答"/>
                            回答
                        </span>
                        <span
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.props.history.push(this.state.transferQuery)
                            }}>
                        <img
                            src={require('../../../images/toTransfer.jpg')}
                            alt="转发"/>
                            转发
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}


export default ParkTransferItem;
