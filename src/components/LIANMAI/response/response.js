/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import ResponseItem from "./responseItem";
import {withRouter} from "react-router-dom";
import {instance} from '../../../config/axiosConfig'
import {connect} from "react-redux";
import style from './rsItem.scss';
import ToastBox from "../Toast/index";



const TestInfo = [
    {
        id: 1,
        title : "有谁在综C捡到了我的身份证吗？ 马上要买票了,求扩散啊!",
        lastChat : {
            user: "Ann",
            detail: "嗷嗷嗷谢谢你! 我周末回学校拿可以吗?"
        },
        endTime: new Date('2018','6','28').getTime(),
        lastChatTime: new Date(new Date().getTime() - 3600*1000),
        hasNews: true,
        hasFinished: false
    },
    {
        id: 2,
        title : "因为临时有事要加班，五月后天的演唱会去不了了，门票急转，小哥哥小姐姐帮帮忙!",
        lastChat : {
            user: "Ann",
            detail: "嗯呢，不好意思哈"
        },
        endTime: new Date('2018','6','28').getTime(),
        lastChatTime: new Date(new Date().getTime() - 3600*1000),
        hasNews: false,
        hasFinished: true
    }
];




@withRouter
@connect(
    state => state.user
)
class Response extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info: []
        }
    }


    componentWillMount() {
        this.setState({
            ID: this.props.id || 4 //todo 后备删除
        },()=>{
            instance.post('/footprint/myAnswer', {ID: this.props.id}).then((res)=>{
                try {
                    let questions = res.data;
                    if (!res.data) return;
                    let info = [];
                    if (questions == null || questions.length < 1) return;
                    for (let v of questions) {
                        let temp = {
                            id: v.questionID,
                            title: v.questionTitle,
                            lastChat: {
                                user: v.nickname,
                                detail: v.content
                            },
                            endTime: v.cutTime,
                            hasNews: v.unRead > 0,
                            noFinished: v.status != 2,
                            token: v.token,
                            dialogueID: v.dialogueID,
                            adopter: v.adopter
                        };
                        info.push(temp);
                    }
                    this.setState({
                        info: info
                    })
                } catch (err) {
                    // ToastBox.warning({
                    //     content: "没有获取到数据"
                    // })
                }
            })
        })
    }


    render() {
        return (
            <div className={'tab'}>
                {this.state.info.length > 0 ? this.state.info.map((v)=>{
                    return <ResponseItem info={v} key={v.id}/>
                }) : <div className={style.empty} >
                    <img src={require('../../../images/empty.png')} alt="没有数据"/>
                    <h4>啥都没有</h4>
                </div>}
            </div>
        );
    }
}

export default Response;
