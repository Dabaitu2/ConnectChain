/**
 *    Created by tomokokawase
 *    On 2018/7/25
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './Chat.scss'
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {clear_marks, clear_status, clear_tag, saveScroll} from "../../redux/actions";
import ConfirmModal from "../../components/LIANMAI/ConfirmModal/ConfirmModal";
import Marks from "../../components/LIANMAI/Marks/Marks";
import {instance} from '../../config/axiosConfig';
import ToastBox from '../../components/LIANMAI/Toast/index';
import PrevantModalBox from "../../components/LIANMAI/preventModal/index";

import {chooseAnswer} from "../../components/LIANMAI/LIANMAI_tools";
import Modal from '../../components/LIANMAI/BetterModal/Index'
import {getLocalPrivateKey} from "../../contractTools/tools";

// 引入socket
import {socket} from '../../App'


const confirmList = [
    require("../../images/wait_confirm.png"),
    require("../../images/confirm.png"),
];

@withRouter
@connect(
    state => state,
    {saveScroll, clear_marks, clear_tag, clear_status}
)
class Chat extends Component {

    constructor(props) {
        super(props);
        this.lastTime = 0;
        this.state = {
            confirm: this.props.user.status == 2, // ChatInfo[0].hasConfirm,
            hasWord: false,
            showEmoji: false,
            text: "",
            userType: 0, // userType 0 为提问者，1为回答者
            leave: false,
            modelleave: false,
            show: false,
            other: "",
            privateKey: "",
            address:"",
            inputPK:""
        };
        // 用户的表情列表
        this.emojiList = "😜 😀 😇 😈 😎 😐 😑 😕 😗 😙 😛 😟 😦 😧 😬 😮 😯 😴 😶 😁 😂 😃 😄 😅 😆 😉 😊 😋 😌 😍 😏 😒 😓 😔 😖 😘 😚 😜 😝 😞 😰 😡 😠 😤 😥 😭 😵"
            .split(' ').filter(v => v).map((v, index) => <li
                key={v + index}
                onTouchStart={(e) => {
                    let target = e.target;
                    target.style.backgroundColor = "#f3efef";
                    target.style.border = "1px #FFB392 solid";
                    this.setState({
                        text: this.state.text + target.textContent
                    });

                }}
                onTouchEnd={(e) => {
                    let style = e.target.style;
                    style.backgroundColor = "#ffffff";
                    style.border = "1px #ffffff solid";
                }}
                style={{
                    border: "1px #ffffff solid"
                }}

            >{v}</li>);
    }

    // 对获取的历史信息进行包装，使其符合渲染格式
    wrapChatInfo = (ChatList) => {
        let {dialogueID, answerer} = this.state;
        let location = this.props.history.location;
        return ChatList.map((v, index) => {
            try {
                return {
                    content: ChatList[index],
                    answerer: answerer || location.query['answerer'],
                    dialogueID: dialogueID,
                    questionID: location.query['questionID'],
                    sourceID: location.query['source'],
                    quizzerIsRead: 0,
                    answerIsRead: 0,
                    hasConfirm: false,
                }
            } catch (err) {
                console.log(err);
            }
        });
    };

    // 初始化socket和聊天窗口位置
    initMsgReceiver = () => {

        this.refs.main.scrollTop
            = this.props.doc.scroll;

        socket.emit('addUser', this.props.user.id);
        socket.on('sendMessage', (data) => {
            if (typeof data !== "string") {
                let {ChatInfo} = this.state;
                let info = ChatInfo.slice(0);
                let len = info.length;
                let newChat = this.WrapperRead(data.detail, len);
                info.push(newChat);
                this.setState({
                    ChatInfo: info
                },()=>{
                    this.refs.main.scrollTop
                        = this.refs.main.scrollHeight;
                    this.saveScroll();
                });
            } else {
                // todo toast全局提示
                console.log(data);
            }
        });
    };

    // 调用的监听器，监听页面滚动事件并且记录到redux
    saveScroll = () => {
        this.props.saveScroll(this.refs.main.scrollTop);
    };

    // 用户确认采纳
    handleConfirm = () => {
        if (this.state.confirm) return;
        this.judge.bind(this)();
    };

    // 模态框离场的处理
    handleLeave() {
        this.setState({
            modelleave: !this.state.modelleave
        })
    }

    PrivateGroup = () => {
        return (
            <div className={style.inputGroup}>
                <input type="password"
                       className={style.privateKey}
                       onChange={(e)=>this.handleChange("inputPK", e.target.value)}
                       placeholder={"请输入您的支付密码"}/>
            </div>
        )
    };

    // 从本地读取公司钥匙
    async acquireAccount(web3, id, pwd) {
        let modal = PrevantModalBox.show();
        try {
            let account = await getLocalPrivateKey(web3, pwd, id);
            if (account) {
                this.setState({
                    privateKey: account.privateKey,
                    address: account.address,
                }, () => {
                    setTimeout(()=>{
                        modal();
                    }, 400);
                    ToastBox.alert({
                        content: "读取公私钥成功!"
                    });
                });
            } else {
                setTimeout(()=>{
                    modal();
                }, 400);
                ToastBox.error({
                    content: "您的支付密码有误!"
                });
            }
        } catch (err) {
            setTimeout(()=>{
                modal();
            }, 400);
            ToastBox.error({
                content: "读取公私钥失败!"
            });
        }

    }

    //模态框处理
    handleTouchChange() {
        if(!this.state.show) {
            if(!this.state.privateKey) {
                Modal.defaults({
                    title: '请先授权解锁私钥',
                    content: this.PrivateGroup(),
                    okText: '确认',
                    cancelText: '取消',
                    key: 'confirm',
                    onOk: () => {
                        this.acquireAccount.bind(this)(this.props.user.web3, this.props.user.id, this.state.inputPK);
                    },
                    onCancel: () => {
                        ToastBox.warning({
                            content: "您取消了采纳!"
                        });
                    }
                });
            } else {
                this.setState({
                    show: !this.state.show
                })
            }
        } else {
            this.setState({
                show: !this.state.show
            })
        }
    }

    // 向服务器发送请求清空未读数据

    async handleClearUnread() {
        let ans = await instance.post('/dialogue/updateUnreadNum', {dialogueID: this.state.dialogueID,
            ID: this.props.user.id});
        if(ans.data.ans === "success") {
            ToastBox.alert({
                content:"消息获取成功!"
            })
        } else {
            ToastBox.error({
                content:"消息获取失败!"
            })
        }
    }



    async tryCreateChat() {
        // 发起聊天的肯定是回答者
        // 暂时先处理回答者
        if (this.props.history.location.query['dialogueID']) {
            let questionID = await instance.post('/dialogue/getQuestionIDbyDialogue', {dialogueID: this.props.history.location.query['dialogueID']});
            instance.post('/dialogue/getEachID', {dialogueID: this.props.history.location.query['dialogueID']}).then((res) => {
                if (res.data[0].nickname && res.data[1].nickname) {
                    if (this.props.user.id == res.data[0].quizzerID) {
                        // userType 0 为提问者，1为回答者
                        this.setState({
                            questionID: questionID.data && questionID.data.data,
                            userType: 0,
                            other: res.data[1].nickname,
                            userSrc: res.data[0].figureurl,
                            otherSrc: res.data[1].figureurl,
                            dialogueID: this.props.history.location.query['dialogueID'],
                            answerer: parseInt(res.data[1].answerer, 10),
                            quizzerID: res.data[0].quizzerID,
                            otherID: res.data[1].answerer,
                        })
                    } else {
                        this.setState({
                            questionID: questionID.data && questionID.data.data,
                            userType: 1,
                            other: res.data[0].nickname,
                            userSrc: res.data[1].figureurl,
                            otherSrc: res.data[0].figureurl,
                            dialogueID: this.props.history.location.query['dialogueID'],
                            answerer: parseInt(res.data[1].answerer, 10),
                            quizzerID: res.data[0].quizzerID,
                            otherID: res.data[0].quizzerID
                        })
                    }
                    // 获取之前的所有对话
                    instance.post('/dialogue/allMessage', {dialogueID: this.props.history.location.query['dialogueID']}).then((res) => {
                        if (res.data == null || res.data.length === 0) {
                            console.log("没有消息");
                            this.setState({
                                ChatInfo: [],
                            },()=>{
                                this.initMsgReceiver();
                                this.handleClearUnread.bind(this)();
                            });
                        } else {
                            this.setState({
                                ChatInfo: this.wrapChatInfo(res.data),
                            }, ()=>{
                                this.initMsgReceiver();
                                this.handleClearUnread.bind(this)();
                            });
                        }
                    });
                }
            });
        } else {
            //通过广场或者share页面进入
            let qid = this.props.history.location.query['questionID'];
            let answerId = this.props.history.location.query['answerer']; // 回答者的props.id
            let quizzerId = this.props.history.location.query['quizzer']; // 提问者的props.id
            let sourceId = this.props.history.location.query['source'];
            // 通过dialogueID进入的肯定是建立了对话的
            // 所以只用在没通过dialogueID进入的来判断是否上链
            instance.post('/dialogue/createDialogue', {
                questionID: parseInt(qid, 10),
                answerer: parseInt(answerId, 10),
                quizzerID: quizzerId,
                sourceID: sourceId
            }).then((res) => {
                if (res.data.ans != 'failure') {
                    if(res.data.ans === "NotOnChain") {
                        ToastBox.warning({
                            content: "该回答已结束，您的操作将无法上链"
                        })
                    }
                    let dialogueID = res.data.dialogueID;
                    instance.post('/dialogue/getEachID', {dialogueID: dialogueID}).then((res) => {
                        if (res.data[0].nickname && res.data[1].nickname) {
                            if (this.props.user.id == res.data[0].quizzerID) {
                                // userType 0 为提问者，1为回答者
                                this.setState({
                                    userType: 0,
                                    other: res.data[1].nickname,
                                    userSrc: res.data[0].figureurl,
                                    otherSrc: res.data[1].figureurl,
                                    dialogueID: dialogueID,
                                    answerer: parseInt(answerId, 10),
                                    quizzerID: quizzerId,
                                    otherID: res.data[1].answerer,
                                    questionID: parseInt(qid, 10)
                                })
                            } else {
                                this.setState({
                                    userType: 1,
                                    other: res.data[0].nickname,
                                    userSrc: res.data[1].figureurl,
                                    otherSrc: res.data[0].figureurl,
                                    dialogueID: dialogueID,
                                    answerer: parseInt(answerId, 10),
                                    quizzerID: quizzerId,
                                    otherID: res.data[0].quizzerID,
                                    questionID: parseInt(qid, 10)
                                })
                            }
                            // 获取之前的所有对话
                            instance.post('/dialogue/allMessage', {dialogueID: dialogueID}).then((res) => {
                                if (res.data == null || res.data.length === 0) {
                                    console.log("没有消息");
                                    this.setState({
                                        ChatInfo: [],
                                    },()=>{
                                        // 初始化聊天ID和主动推送
                                        this.initMsgReceiver();
                                    });
                                } else {
                                    this.setState({
                                        ChatInfo: this.wrapChatInfo(res.data),
                                    },()=>{
                                        // 初始化聊天ID和主动推送
                                        this.initMsgReceiver();
                                    });
                                }

                            });
                        }
                    });
                }
            });
        }
};


    async judge() {

        let {user} = this.props;
        let {questionID, otherID, privateKey, address} = this.state;

        let serializedTx = await chooseAnswer(
            user.id,
            questionID,
            otherID,
            user.instance,
            privateKey,
            address,
            user.web3
            );
        // TODO 此处合约有个bug, 应该设置限制条件 只能处在未完成情况下的问题能采纳，现在暂时前台限制
        let modal = PrevantModalBox.show();
        let ans = await instance.post('/eth/tryTrade', {serializedTx: serializedTx});
        if (ans.data.ans && ans.data.ans==="success") {
            let judgeResult =  await instance.post('/dialogue/judge', {
                                    ID: otherID,
                                    skillType: user.tag,
                                    credit: user.marks,
                                    questionID: questionID,
                                    adopter: otherID
                                });
            if (judgeResult.data.ans === "success") {
                setTimeout(()=>{
                    modal();
                },400);
                ToastBox.success({
                    content: "采纳成功!"
                });
                this.setState({
                    confirm: true
                },()=>{
                    this.props.clear_marks();
                    this.props.clear_tag();
                    // this.props.clear_status();
                })
            } else {
                setTimeout(()=>{
                    modal();
                },400);
                ToastBox.error({
                    content: "采纳失败!"
                })
            }
        } else {
            setTimeout(()=>{
                modal();
            },400);
            ToastBox.error({
                content: "采纳失败!"
            })
        }
    };

    handleChange = (key, value) => {
      this.setState({
          [key]: value
      });
    };

    componentWillMount() {
        this.tryCreateChat.bind(this)();
    }

    /**
     * 在组件挂载开启对当前页面主体的滑动监听
     * 并且获取redux中之前保存的页面滚动位置
     * 时页面在渲染前先滚动到此位置
     * 在组件取消挂载时移除这个监听器
     * */
    componentDidMount() {
        this.refs.main.addEventListener("scroll", this.saveScroll);
        this.refs.main.scrollTop = this.props.doc.scroll === 0 ? this.refs.main.scrollHeight : this.props.doc.scroll;
    }
    componentWillUnmount() {
        console.log("chat组件卸载开始!====================")
        socket.removeEventListener('sendMessage');
        // this.props.clear_status();
        this.refs.main.removeEventListener("scroll", this.saveScroll);
    }
    /**
     * 包装新增消息，添加入消息列表中并渲染
     *  是sendMsg的辅助方法
     * */
    WrapChatList = (msg, index) => {
        let {history, user} = this.props;
        return {
            dialogueID: index,
            questionID: history.location.query['questionID'],
            answerer: history.location.query['answerer'],
            sourceID: history.location.query['source'],
            content: {
                answerer: user.id,
                time: new Date().getTime(),
                isImg: 0,
                detail: msg
            },
            quizzerIsRead: 0,
            answerIsRead: 0,
            hasConfirm: false,
        }
    };
    /**
     * 推送的新消息的包装方法
     * */
    WrapperRead = (msg, index) => {
        let {history} = this.props;
        return {
            dialogueID: index,
            questionID: history.location.query['questionID'],
            answerer: history.location.query['answerer'],
            sourceID: history.location.query['source'],
            content: {
                answerer: this.state.otherID,
                time: new Date().getTime(),
                isImg: 0,
                detail: msg
            },
            // 他们可以用来控制小红点
            quizzerIsRead: 0,
            answerIsRead: 0,
            hasConfirm: false,
        }
    };
    /**
     * 用户发送新消息
     * */
    sendMsg = (v) => {
        let {ChatInfo, quizzerID, answerer, dialogueID, otherID, other, userSrc} = this.state;
        let {user} = this.props;
        let info = ChatInfo.slice(0);
        let len = info.length;
        let newChat = this.WrapChatList(v, len);
        info.push(newChat);
        socket.emit('sendMessage', {
            quizzerID: quizzerID,
            answerer:  answerer,
            dialogueID: dialogueID,
            content:{
                answerer: user.id,
                time: new Date().getTime(),
                isImg: 0,
                detail: v
            },
            userId: user.id,
            otherId: otherID,
            whoAmI: this.props.user.userName,
            myFigureurl: userSrc
        });
        this.setState({
            ChatInfo: info
        }, () => {
            this.refs.main.scrollTop
                = this.refs.main.scrollHeight;
        });
    };


    render() {
        let {ChatInfo, userType, show, num, modelleave,
            other, text, otherSrc,
            userSrc, showEmoji, hasWord, leave, confirm} = this.state;
        let {user, history} = this.props;
        return (
            <div className={style.main}
                 ref={"main"}
            >
                <ConfirmModal
                    icon={'spaceship'}
                    handleShow={this.handleTouchChange.bind(this)}
                    handleConfirm={this.handleConfirm.bind(this)}
                    handleLeave={this.handleLeave.bind(this)}
                    show={show}
                    num={num}
                    leave={modelleave}
                    ref={'modal'}
                >
                    <h3 style={{
                        margin: "0 auto",
                        padding:"1.5rem 0",
                        borderRadius: "5px",
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        backgroundColor: "rgb(107, 183, 252)",
                        color: "#FFF",
                        fontSize: "1rem"
                    }}>确认采纳{this.state.other}的回答了吗?</h3>
                    <Marks ID={this.state.otherID}/>
                </ConfirmModal>
                <div className={style.header}>
                    <div className={style.left}>
                        <span onTouchStart={()=>{history.push('/center/pace')}}>
                            <img src={require('../../images/leftBack.jpg')} alt="back" className={style.back}/>
                        </span>
                        <span>{other !== "" ? other : ""}</span>
                    </div>
                    <div className={style.right}
                         style={{
                             // userType 0 为提问者，1为回答者
                             display: userType == 0 ? "flex" : "none"
                         }}
                    >
                        <img
                            onClick={(e) => {
                                if (confirm) return;
                                this.handleTouchChange.bind(this)(e);
                            }}
                            className={style.confirm}
                            src={confirm ? confirmList[1] : confirmList[0]} alt=""/>
                        {
                            confirm ? <span>已采纳</span> : ""
                        }
                    </div>
                    <div
                        className={style.right}
                        style={{
                            // userType 0 为提问者，1为回答者
                            display: userType == 1 ? "flex" : "none"
                        }}
                    >
                        <a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=1027029629&site=qq&menu=yes">
                            联系客服
                        </a>
                    </div>
                </div>
                <div
                    ref={'chatCointainer'}
                    className={style.chatContainer}
                    style={{
                        marginBottom: showEmoji ? leave ? "5rem" : "16rem" : "5rem"
                    }}
                >
                    {ChatInfo  && ChatInfo.length > 0 ? ChatInfo.map((v, index) => {
                        let timeInfo = "";
                        if (index == 0 || v.content.time - this.lastTime >= 9600 * 1000) {
                            timeInfo =
                                <h4 style={{textAlign: "center", margin: "0", color: "#8d8d8d", fontWeight: "300"}}>
                                    {new Date().getTime() - new Date(v.content.time).getTime() < 24 * 3600 * 1000 ?
                                    new Date(v.content.time)
                                        .toLocaleString()
                                        .split(" ")[1]
                                        .replace("午", "午") : new Date(v.content.time)
                                        .toLocaleString()}
                                </h4>
                        } else {
                            timeInfo = ""
                        }
                        this.lastTime = v.content.time;
                        if (v.content.answerer != user.id) {
                            // 归属于对方的消息
                            return (
                                <div className={style.chatWrapper} key={v+index}>
                                    {timeInfo}
                                    <div className={style.chatItem}>
                                        <div className={style.avatarWrapper}>
                                            <img src={otherSrc} alt="answer" className={style.avatar}/>
                                        </div>
                                        <div className={style.chatMain}>
                                            <span className={style.triangle}/>
                                            <span className={style.pop}>{v.content.detail}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        } else {
                            // 归属于自己的消息
                            return (
                                <div style={style.chatWrapper} key={v+index}>
                                    {timeInfo}
                                    <div className={style.ReverseChatItem}>
                                        <div className={style.avatarWrapper}>
                                            <img src={userSrc} alt="me" className={style.avatar}/>
                                        </div>
                                        <div className={style.chatMain}>
                                            <span className={style.triangle}/>
                                            <span className={style.pop}>{v.content.detail}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    }) : ""}
                </div>
                <div className={style.bottom}>
                    <img src={require('../../images/add_image.png')}
                         onTouchStart={() => {
                             if (showEmoji) {
                                 setTimeout(() => {this.setState({showEmoji: false})}, 500);
                                 this.setState({leave: true});
                             } else {
                                 this.setState({showEmoji: true, leave: false}, () => {
                                     setTimeout(() => {
                                         this.refs.main.scrollTop = this.refs.main.scrollHeight + 10;
                                     }, 300);
                                 });
                             }
                         }}
                         alt="image" className={style.image}/>
                    <input type="text"
                           onChange={(e) => {
                               this.setState({
                                   text: e.target.value,
                                   hasWord: e.target.value.length > 0
                               })
                           }}
                           value={text}
                           placeholder={"请输入信息..."}
                           className={style.newMsg}/>
                    <span
                        onTouchStart={
                            () => {
                                if (text === "" || text === " ") return;
                                this.sendMsg(text);
                                this.setState({text: ""})
                            }
                        }
                        style={{
                            color: hasWord ? "#24a2ff" : "#999090",
                            fontSize: "1rem"
                        }}>发送</span>
                </div>
                {
                    showEmoji ? <div className={`${style.emojiWrapper} ${leave ? style.leave : ""}`}>
                        <ul ref="emojiTab" className={`${style.emojiTab}`}>
                            {this.emojiList.map(v => {
                                return v;
                            })}
                        </ul>
                    </div> : null
                }
            </div>
        );
    }
}


export default Chat;
