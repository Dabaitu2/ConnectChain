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


@withRouter
@connect(
    state => state.user
)
class Pace extends Component {

    constructor(props) {
        super(props);
        this.transitionMode = ""
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


    componentWillUnmount() {
        socket.removeEventListener('sendMessage');
    }


    render() {
        const {path} = this.props;
        return (
            <div className={'viewPort'}>
                <SlideBar />
                <div className={'tabList'}>
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
