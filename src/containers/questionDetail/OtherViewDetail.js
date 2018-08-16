/**
 *    Created by tomokokawase
 *    On 2018/8/14
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './OtherViewDetail.scss';
import {instance} from '../../config/axiosConfig'
import {withRouter} from "react-router-dom";
import {SecondToDate, transferNormal, transferTZ} from "../../utils/dates";
import {connect} from "react-redux";
import ToastBox from "../../components/LIANMAI/Toast/index";
import _ from "lodash";


const srcList = [
    require('../../images/textEdit.jpg'),
    require('../../images/EditConfirm.jpg')
];


@withRouter
@connect(
    state => state.user
)
class QuestionDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            onEdit: false,
            tips: 0,
            height: 5,
            initialHeight: 5,
            details: "",
            info: {},
            UserList: []
        }
    }

    async getForwardList() {
        let previousID = this.props.history.location.query ? this.props.history.location.query.previousID : 0;
        const rst = await instance.post('/footprint/getForwardChains', {questionID: this.state.qid, ID: this.props.id, previousID: previousID});
        let UserList = rst.data;
        if(UserList.ans == "fail" || UserList == null) {
            ToastBox.error({
                content: "获取转发链接失败!"
            });
            return;
        }



        UserList = _.uniqBy(UserList.reverse(), 'ID').reverse();

        console.log(UserList);

        this.setState({
            UserList: UserList.slice(0)
        })
    }

    componentWillMount() {
        console.log(this.props.history);
        let qid = this.props.history.location.pathname.split("/")[2];
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

            let qInfo = res.data[0];

            this.setState({
                details: userInfo.details,
                info: userInfo,
                qid: qid,
                time: transferNormal(transferTZ(res.data[0].time)),
                title: qInfo.title,
                token: qInfo.token,
                remain: lastTime,
                adopter: qInfo.adopter,
                answerer: qInfo.answerer,
                forwardNum: qInfo.forwardNum
            },()=>{
                this.getForwardList.bind(this)();
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
        let tags = this.props.history.location.query ? this.props.history.location.query.tags : [];
        let {info,
            onEdit,
            details,
            height,
            time,
            title,
            token,
            remain,
            answerer,
            forwardNum
        } = this.state;
        return (
            <div className={style.main}>
                <div className={style.back}>
                    <img onClick={this.props.history.goBack} src={require('../../images/leftBack.jpg')} alt="back"/>
                </div>
                <div className={style.head}>
                    <div className={style.avatar}>
                        <img src={info.avatarSrc} alt="avatar" className={style.myAvatar}/>
                    </div>
                    <div className={style.InfoGroup}>
                        <div className={style.userInfo}>
                            <span className={style.userName}>{info.userName}</span>
                            <span>{time}</span>
                        </div>
                        <div className={style.tags}>
                            <img src={require('../../images/tag.png')} alt="tag"/>
                            <div className={style.tagsDetail}>
                                {tags instanceof Array ? tags.map(v=>(
                                    <span key={v}>{v}</span>
                                )): ""}
                            </div>
                        </div>
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
                            minHeight : "4rem"
                        }}
                    />
                    <div className={style.assistInfo}>
                        <span><img src={require('../../images/transfer.jpg')} alt="transfer"/>{forwardNum}</span>
                        <span><img src={require('../../images/answerTip.png')} alt="answer"/>{answerer}</span>
                        <span><img src={require('../../images/mcoin.jpg')} alt="coin"/>{token}</span>
                    </div>
                </div>
                <div className={style.bottomContainer}>
                <div className={style.forwardList}>
                    <ul>
                    {
                        this.state.UserList.map((v, index)=>{
                            return (<li className={`
                                    ${style.UserAvatar}
                                    ${v.ID === this.props.id || index ===0 ? style.border : ""}
                            `}>
                                <img src={v.figureurl} alt="avatar"/>
                            </li>)
                        })
                    }
                    </ul>
                </div>
                </div>
                <div className={style.btnGroup}>
                    <span onClick={()=>{
                        // console.log(this.props.history.location.query.ansQuery);
                        this.props.history.push(this.props.history.location.query.ansQuery);
                    }}>我来回答</span>
                    <span
                        onClick={()=>{
                            this.props.history.push(this.props.history.location.query.transferQuery);
                        }}
                    >帮忙转发</span>
                </div>

            </div>
        );
    }
}


export default QuestionDetail;
