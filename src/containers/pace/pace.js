/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {connect}    from "react-redux";
import {withRouter} from "react-router-dom";
import Publish      from "../../components/LIANMAI/publish/publish";
import Response     from "../../components/LIANMAI/response/response";
import Transfer     from "../../components/LIANMAI/transfer/transfer";
import SlideBar     from "../../components/LIANMAI/slideBar/slideBar";
import {socket}     from '../../App'
import  MsgBox      from "../../components/LIANMAI/MsgBox/index";

import {CSSTransitionGroup} from "react-transition-group";
import './pace.scss'
import {changePath} from "../../redux/actions";


@withRouter
@connect(
    state => state.user,
    {changePath}
)
class Pace extends Component {

    constructor(props) {
        super(props);
        this.transitionMode = ""
        this.state = {
            startX: 0,
            showChange: false,
            direction: 0
        }
    }

    componentWillUpdate(nextProps, nextState) {
        console.log(this.props.path, nextProps.path);

        switch (nextProps.path){
            case "publish" :
                this.transitionMode = "example";
                return;
            case "transfer" :
                if (this.props.path === "publish") {
                    this.transitionMode = "reverse";
                } else {
                    this.transitionMode = "secReverse";
                }
                return;
            case "response" :
                if (this.props.path === "publish") {
                    this.transitionMode = "reverse";
                } else {
                    this.transitionMode = "example";
                }
                return;
            default:
                return;
        }
    }


    componentDidMount() {
        setTimeout(()=>{
            socket.emit('addUser', this.props.id);
            socket.on('sendMessage', (data) => {
                console.log(data);
                if(data === "成功加入") {
                    console.log("Pace页面监听启动");
                    return;
                }
                MsgBox.alert({
                    src: data.figureurl,
                    content: data.answerer+"："+data.detail.substring(0, 15)+"...",
                    dialogueID: data.dialogueID,
                    history: this.props.history
                });
            });
        }, 500);
    }

    chooseWhereToGo = (now, direction) => {
        if(direction === 1) {
            switch (now) {
                case "transfer":
                    return "response";
                default:
                    return "publish";
            }
        } else {
            switch (now) {
                case "publish":
                    return "response";
                default:
                    return "transfer";
            }
        }
    };

    componentWillUnmount() {
        socket.removeEventListener('sendMessage');
    }


    render() {
        const {path} = this.props;
        return (
            <div className={'viewPort'}>
                <SlideBar />
                <div className={'tabList'}
                     onTouchStart={(e)=>{
                         this.setState({
                             startX: e.touches[0].pageX
                         });
                         console.log(e.touches[0].pageX);
                     }}
                     onTouchMove={(e)=>{
                         if(Math.abs(e.touches[0].pageX - this.state.startX) > document.body.clientWidth * 0.2) {
                             this.setState({
                                 shouldChange: true,
                                 // 1 为向右滑(获取左边) 0 为向左滑，获取右边
                                 direction: e.touches[0].pageX - this.state.startX > 0 ? 1:0
                             });
                         } else {
                             this.setState({
                                 shouldChange: false
                             });
                         }
                     }}
                     onTouchEnd={()=>{
                         if(this.state.shouldChange) {
                             const dest = this.chooseWhereToGo(this.props.path, this.state.direction);
                             this.props.changePath(dest);
                         }
                     }}
                >
                <CSSTransitionGroup
                    transitionName={this.transitionMode}
                    transitionEnterTimeout={400}
                    transitionLeaveTimeout={400}>
                    {path === 'publish'? <Publish/>:""}
                    {path === 'response'? <Response/>:""}
                    {path === 'transfer'? <Transfer/>:""}
                </CSSTransitionGroup>
                </div>
            </div>
        );
    }
}


export default Pace;
