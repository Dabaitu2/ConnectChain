/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './transfer.scss';
import TransferItem from "./TransferItem";
import {instance} from '../../../config/axiosConfig'
import {connect} from "react-redux";


const TestInfo = [
    {
        id: 1,
        username: "阿圆不长胖",
        title : "有谁在综C捡到了我的身份证吗？ 马上要买票了,求扩散啊!",
        endTime: new Date('2018','6','28').getTime(),
        lastChatTime: new Date(new Date().getTime() - 3600*1000),
        hasNews: true,
        hasFinished: false,
        status: "success",
    },
    {
        id: 2,
        username: "EVAN",
        title : "因为临时有事要加班，五月后天的演唱会去不了了，门票急转，小哥哥小姐姐帮帮忙!",
        endTime: new Date('2018','6','28').getTime(),
        lastChatTime: new Date(new Date().getTime() - 3600*1000),
        hasNews: false,
        hasFinished: true,
        status: "inProgress",
    }
];

@connect(
    state => state.user
)
class Transfer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info : []
        }
    }


    componentWillMount() {

        this.setState({
            ID: this.props.id || 4 //todo 后备删除
        },()=>{
            instance.post('/footprint/myForward',{ID: this.props.id}).then((res)=>{
                console.log(res);
                console.log("????");
                if (res.data.ans === "fail" || res.data == null || res.data.length < 1) {
                    console.log("no data");
                    return;
                } else {
                    console.log("yes！");
                    let questions = res.data;
                    let info = [];
                    console.log(res);
                    for (let v of questions) {
                        if (v==null || v==[]) continue;
                        let temp = {
                            id: v.questionID,
                            username: v.nickname,
                            title : v.title,
                            endTime: new Date('2018','6','28').getTime(),
                            status: v.stauts === 0 ? "failed" : v.status === 1 ? "inProgress" : "success",
                            imgUrl: v.figureurl,
                            link: v.link
                        };
                        info.push(temp);
                    }
                    this.setState({
                        info: info
                    })
                }

            })
        })
    }


    render() {
        return (
            <div className={'tab'}>
                {this.state.info.length > 0 ? this.state.info.map((v)=>{
                    return <TransferItem info={v} key={v.id}/>
                }) : <div className={style.empty} >
                    <img src={require('../../../images/empty.png')} alt="没有数据"/>
                    <h4>啥都没有</h4>
                </div>}
            </div>
        );
    }
}
export default Transfer;
