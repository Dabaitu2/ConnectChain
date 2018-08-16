/**
 *    Created by tomokokawase
 *    On 2018/7/25
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './QuestionDetial.scss';
import {instance} from '../../config/axiosConfig'
import {withRouter} from "react-router-dom";
import {SecondToDate, transferNormal, transferTZ} from "../../utils/dates";
import ToastBox from "../../components/LIANMAI/Toast/index";


const srcList = [
    require('../../images/textEdit.jpg'),
    require('../../images/EditConfirm.jpg')
];


@withRouter
class QuestionDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            onEdit: false,
            tips: 0,
            height: 5,
            initialHeight: 5,
            details: "",
            info: {}
        }
    }


    componentWillMount() {
        let qid = this.props.history.location.pathname.split("/")[2];
        console.log(qid);
        instance.post('/footprint/releaseDetail', {questionID: qid}).then((res)=>{
           console.log(res);
           let userInfo = {};
           userInfo.avatarSrc = res.data[0].figureurl;
           userInfo.userName = res.data[0].nickname;
           userInfo.details = res.data[0].content;
           let answerList = [];
           for (let i = 1; i < res.data.length; i++ ) {
               let temp = {
                   avatarSrc: res.data[i].figureurl,
                   userName: res.data[i].nickname,
                   details: res.data[i].content.length ? res.data[i].content[res.data[i].content.length - 1 ].detail : "",
                   dialogueID: res.data[i].dialogueID,
                   answerer: res.data[i].answerer
               };
               answerList.push(temp);
           }
           userInfo.answerList = answerList;
           let lastTime =  (transferTZ(res.data[0].cutTime)-new Date().getTime())/1000;
               lastTime = lastTime > 0 ? SecondToDate(lastTime) : "0天" ;
               console.log(res.data[0]);
            this.setState({
                details: userInfo.details,
                info: userInfo,
                qid: qid,
                time: transferNormal(transferTZ(res.data[0].time)),
                title: res.data[0].title,
                token: res.data[0].token,
                remain: lastTime,
                adopter: res.data[0].adopter
            })
        });

    }


    onEdit = (v) => {
        // 关键是先设置为auto，目的为了重设高度（如果字数减少）
        if(this.state.height > 15) {
            this.refs.myTA.style.height = 'auto';
        }

        //如果高度不够，再重新设置
        if (this.refs.myTA.scrollHeight >= this.refs.myTA.offsetHeight) {
            this.refs.myTA.style.height = this.refs.myTA.scrollHeight + 'px'
        }
        this.setState({
            details : v
        })
    };

    render() {
        let {info, onEdit, details, height, tips, initialHeight, time, title, token, remain} = this.state;
        return (
            <div className={style.main}>
                <div className={style.back}>
                    <img onClick={this.props.history.goBack} src={require('../../images/leftBack.jpg')} alt="back"/>
                    <span>问题详情</span>
                </div>
                <div className={style.head}>
                    <div className={style.avatar}>
                        <img src={info.avatarSrc} alt="avatar" className={style.myAvatar}/>
                    </div>
                    <div className={style.userInfo}>
                        <span className={style.userName}>{info.userName}</span>
                        <span>发布于{time}</span>
                    </div>
                </div>
                <div className={style.details}>
                    <h4 className={style.title}>{title}</h4>
                    <textarea
                        onChange={(e)=>{this.onEdit(e.target.value)}}
                        ref="myTA"
                        disabled={!onEdit}
                        value={details}
                        style={{
                            height: `${height}rem`,
                            minHeight : "5rem"
                        }}
                    />
                    <div className={style.assistInfo}>
                        <span><img src={require('../../images/time.png')} alt="coin"/>还剩{remain}</span>
                        <span><img src={require('../../images/mcoin.jpg')} alt="coin"/>{token}</span>
                    </div>
                    <span
                        className={style.edit}
                        onClick={()=>{
                            this.setState({
                                onEdit: !onEdit,
                                // 0为编辑 1为保存
                                tips: tips === 1 ? 0:1,
                                height: tips === 0 ?
                                        height > 7 ?
                                            height : 7 : initialHeight
                            }, ()=>{
                                if(tips === 1) {
                                    instance.post('/questions/updateQuestion', {questionID: this.state.qid, content: this.state.details}).then(rst=>{
                                        if(rst.data.ans === "success") {
                                            ToastBox.success({
                                                content: "更新详情成功"
                                            });
                                        } else {
                                            ToastBox.error({
                                                content: "更新详情失败"
                                            });
                                        }
                                    }).catch(err => {
                                        ToastBox.error({
                                            content: "更新详情失败"
                                        });
                                        console.log(err);
                                    })
                                }
                                console.log(height);
                            })
                        }}
                    ><img src={srcList[tips]} alt="btn"/></span>
                </div>
                <div className={style.response}>
                    <ul>
                        {
                            info && info.answerList ? info.answerList.map((v) => {
                                return (
                                    <li onClick={()=>{
                                        this.props.history.push({
                                            pathname: `/Chat`,
                                            query: {
                                                dialogueID: v.dialogueID,
                                            }
                                        })
                                    }}>
                                        <div className={style.avatarWrapper}>
                                            <div className={style.smallAvatar}>
                                                <img src={v.avatarSrc} alt="avatar" className={style.Avatar}/>
                                            </div>
                                        </div>
                                        <div className={style.answerDetail}>
                                            <div >{v.userName}</div>
                                            <div style={{
                                                color: "#b4b4b4",
                                                paddingTop: "0.2rem"
                                            }}>{v.details.length > 15 ?
                                                v.details.substring(0,15) + "..." : v.details}</div>
                                        </div>
                                        {
                                            v.answerer === this.state.adopter ?
                                            <img src={require("../../images/confirm.png")} alt="中标者"
                                                 className={style.lucky}/> : ""
                                        }
                                    </li>
                                )
                            }) : ""
                        }
                    </ul>
                </div>
            </div>
        );
    }
}


export default QuestionDetail;
