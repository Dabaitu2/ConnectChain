/**
 *    Created by tomokokawase
 *    On 2018/7/24
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './newQuesion.scss'
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import Slider from "../../components/LIANMAI/Slider/slider";
import Modal from "../../components/LIANMAI/Modal/modal";
import {instance} from '../../config/axiosConfig';
import {publish} from "../../components/LIANMAI/LIANMAI_tools";
import {getLocalPrivateKey} from "../../contractTools/tools";
import TipsModal from "../../components/LIANMAI/TipsModal/TipsModal";
import ToastBox from '../../components/LIANMAI/Toast/index';
import PrevantModalBox from "../../components/LIANMAI/preventModal/index";



@withRouter
@connect(
    state => state.user
)
class NewQuestion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            choose: 1,
            show: false,
            num: 1,
            leave: false, // 是否即将触发离场动画
            content: "",
            day: 1,
            title: "",
            pwd: "",
            modalleave: false,
            showPayModal: false,
            tags: [],
            tagEdit: false,
            tagField: "",
            tagTips: "+添加标签"
        }
    }

    handleChange = (key, value) => {
        this.setState({
            [key]: value
        })
    };

    async handleSubmit() {
        let {id, web3} = this.props;
        let {content, num, day, title, privateKey, address, tags} = this.state;
        let wrapData = {
            ID: id,
            content: content,
            token: num,
            label: tags,
            day:  day,
            title: title,
        };
        instance.post('/questions/saveQuestion', wrapData).then((res)=>{
            if(res.data.ans === "success") {
                let qid = res.data.questionID;
                console.log(qid);
                publish(id, num, qid, day, 0, this.props.instance, privateKey, address, web3).then((serializedTx)=>{
                    console.log(serializedTx);
                    instance.post('/eth/tryTrade', {serializedTx: serializedTx}).then((res)=>{
                        if (res.data.ans === "success") {
                            instance.post('/my/updateToken', {ID: id});
                            this.firstForward.bind(this)(qid, id, privateKey, address, web3);
                        } else {
                            console.log("提问失败!");
                        }
                    });
                });
            } else {
                ToastBox.error({
                    content: "提问失败!"
                });
            }
        })
    };

    async firstForward(qid, userId) {
        instance.post('/questions/firstForward',{
            questionID: qid,
            ID: userId
        }).then(rst=>{
            if (rst.data.ans === 'success') {
                ToastBox.success({
                    content: "提问成功!"
                });
                setTimeout(()=>{
                    this.props.history.push(`/share?questionID=${qid}&previousID=${this.props.id}&ID=${this.props.id}`);
                }, 1500);
            } else {
                ToastBox.error({
                    content: "提问失败!"
                });
            }
        });
    }

    onEdit = (e) => {
        //关键是先设置为auto，目的为了重设高度（如果字数减少）
        this.refs.myTA.style.height = 'auto';

        //如果高度不够，再重新设置
        if (this.refs.myTA.scrollHeight >= this.refs.myTA.offsetHeight) {
            this.refs.myTA.style.height = this.refs.myTA.scrollHeight + 'px'
        }
        this.setState({
            content: e.target.value
        })
    };

    handleTouchChange () {
        this.setState({
            show: !this.state.show
        })
    }

    handleCoinsChange (num) {
        num = parseInt(num, 10);
        if (isNaN(num) && num!=="") {
            num = 0;
        }
        if (num < 0) {
            num = 0;
        }
        this.setState({
            num : num
        })
    }

    handleCoinsBlur(num) {
        if(num === 0) num = 1;
        this.setState({
            choose : parseInt(num,10)
        })
    }

    async handleConfirm() {
        // 没有网络或登陆状态错误
        let {address_state, id,  web3} = this.props;
        let {pwd} = this.state;
        switch (address_state) {
            case true: {
                this.acquireAccount.bind(this)(web3, id, pwd);
                break;
            }
            case false: {
                this.goToWallet();
                break;
            }
            default: {
                this.goToWallet();
                break;
            }
        }
    };

    async acquireAccount(web3, id, pwd) {
        let modal = PrevantModalBox.show();
        let account      = await getLocalPrivateKey(web3, pwd, id);
        if (account) {
            this.setState({
                privateKey: account.privateKey,
                address: account.address,
            }, () => {
                setTimeout(()=>{
                    modal();
                },400);
                ToastBox.alert({
                    content: "读取公私钥成功!"
                });
                this.handlePayModalLeave();
                setTimeout(() => {
                    this.handlePayModalTouchChange();
                }, 1000);
            });
        } else {
            setTimeout(()=>{
                modal();
            },400);
            ToastBox.error({
                content: "您的支付密码有误!"
            });
        }
    }

    goToWallet = () => {
        this.props.history.push(`/wallet`);
    };

    haveKeysPanel = () => {
        return (
            <div>
                <h3 style={{margin: "0.5rem auto"}}>申请调用私钥</h3>
                <div className={style.hint}>请输入您设置的支付密码</div>
                <div className={style.hint}>该步骤可以在断网条件下进行!</div>
                <input
                    type="password" id={"password"} placeholder={"请输入您的密码"}
                    onChange={(e)=>{this.handleChange("pwd", e.target.value);}}
                    className={style.passwordInput}/>
                <div>
                    <p
                        className={style.opt}
                        onClick={()=>{this.props.history.push('/wallet')}}
                    ><span className={style.bindNav}>去钱包创建已有私钥文件</span></p>
                </div>
            </div>
        )
    };

    noKeysPanel = () => {
        let {history} = this.props;
        return (
            <div >
                <h3 style={{margin: "0.5rem auto"}}>您还没有绑定地址!</h3>
                <div>
                    <h5>您需要先绑定地址再进行操作!</h5>
                    <p
                        className={style.opt}
                        onClick={()=>{history.push(`/wallet`)}}
                    ><span className={style.bindNav}>直接去钱包绑定已有地址</span></p>
                </div>
            </div>
        );
    };

    decidedShowWhichPanel = (flag) => {
        switch (flag) {
            case true:
                return this.haveKeysPanel();
            default:
                return this.noKeysPanel();
        }
    };

    handleDays = (day) => {
        this.setState({
            day: day
        })
    };

    handleLeave() {
        this.setState({
            leave: !this.state.leave
        })
    }

    handlePayModalLeave() {
        this.setState({
            modalleave: !this.state.modalleave
        },()=>{
           console.log("进出场状态应该发生了变化")
        })
    };

    handlePayModalTouchChange() {
        this.setState({
            showPayModal: !this.state.showPayModal
        })
    }

    Edit = () => {
        this.setState({
            tagEdit: !this.state.tagEdit,
            tagTips: this.state.tagTips === "+添加标签" ? "√完成添加" : "+添加标签"
        })
    };

    addTag = () => {
        if(this.state.tagField.length === 0 || this.state.tagField === ' ') return;
        let tags = this.state.tags.slice(0);
        tags.push(this.state.tagField);
        this.setState({
           tags: tags.slice(0),
           tagField: ""
        }, ()=>{
            this.refs.input.value = ""
        });
    };




    componentWillMount() {
        this.setState({
            showPayModal: true
        });
    }


    // TODO 注入路由
    render() {

        let {title, content, showPayModal, modalleave, show, num, leave, tags, choose, tagEdit} = this.state;
        let {history, address_state} = this.props;

        return (
            <div className={style.main}>
                <div className={style.header}>
                    <span>
                        <img src = {require('../../images/back.png')}
                             alt = "back"
                             className = {style.back}
                             onClick   = {history.goBack}
                        />
                    </span>
                    <span
                        className    = {style.publish}
                        onTouchStart = {this.handleSubmit.bind(this)}>发布</span>
                </div>
                <input type="text"
                       placeholder={"问题标题"}
                       onChange={(e)=>{
                           this.setState({
                               title: e.target.value
                           })
                       }}
                       value={title}
                       className={style.title}/>
                <div className={style.textArea}>
                    <textarea
                        ref      = "myTA"
                        value    = {content}
                        onChange = {this.onEdit}
                        placeholder = {"请输入问题描述..."}/>
                </div>
                <div className = {style.tags}>
                    <ul>
                        {tags.map((v, index)=>{
                            return (
                                <span className={style.tag} key={v}># {v}</span>
                            )
                        })}
                        <span
                            className={style.tag}
                            onClick={this.Edit}
                        >{this.state.tagTips}</span>
                    </ul>
                </div>
                <div className={style.addInput}>
                    <input type="text"
                           style={{
                               width: tagEdit ? '8rem' : 0,
                               border: 0,
                               backgroundColor: tagEdit ? 'rgb(143, 207, 255)' : "#ffffff"
                           }}
                           ref={'input'}
                           onChange = {(e)=>{
                               this.setState({
                                   tagField: e.target.value
                               });
                           }}
                           className = {style.newTag}/>
                    <span>
                        <img
                            src   = {require('../../images/blue-confirm.jpg')}
                            style = {{
                                opacity: tagEdit ? 1 : 0
                            }}
                            onClick = {this.addTag}
                            alt = "confirm"/>
                    </span>
                </div>
                <div className = {style.setting}>
                    <div className = {style.chooseCoin}
                         onTouchStart={()=>{this.handleTouchChange.bind(this)();}}>
                        <img
                            alt = "coins"
                            src = {require('../../images/Mcoin.png')}
                            className = {style.mainImg}
                        />
                        M币: <span className={`sub-color ${style.requireInfo}`}>{choose}个</span>
                        <img
                            alt = "questions"
                            src = {require('../../images/question.png')}
                            className = {style.subImg}
                        />
                    </div>
                    <div className={style.chooseCoin}>
                        <img
                            alt = "coins"
                            src = {require('../../images/calendar.jpg')}
                            className={style.mainImg}
                        />
                        时限: <div className={style.slideline}>
                        <Slider handleDays={this.handleDays.bind(this)}/>
                    </div>
                    </div>

                </div>
                <TipsModal
                    icon  = {'unlock'}
                    show  = {showPayModal}
                    leave = {modalleave}
                    handleBack    = {history.goBack}
                    handleConfirm = {this.handleConfirm.bind(this)}
                    handleLeave   = {this.handlePayModalLeave.bind(this)}
                    handleShow    = {this.handlePayModalTouchChange.bind(this)}
                >
                    {this.decidedShowWhichPanel(address_state)}
                </TipsModal>
                    <Modal
                        show  = {show}
                        num   = {num}
                        icon  = {'money'}
                        leave = {leave}
                        handleShow    = {this.handleTouchChange.bind(this)}
                        handleLeave   = {this.handleLeave.bind(this)}
                        handleConfirm = {this.handleCoinsBlur.bind(this)}


                    >
                    <input type        = "text"
                           value       = {num}
                           className   = {style.number}
                           placeholder = {1}
                           onBlur   = {()=>{this.handleCoinsBlur.bind(this)(num)}}
                           onChange = {(v)=>{this.handleCoinsChange.bind(this)(v.target.value)}}
                            />
                    <span style={{
                        display: "inline-block",
                        fontSize:"1.3rem",
                        color:"#8b8b8b"
                    }}>个</span>
                </Modal>
            </div>
        );
    }
}


export default NewQuestion;
