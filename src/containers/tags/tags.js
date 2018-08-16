/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './tags.scss'
import {withRouter} from "react-router-dom";
import throttle from 'throttle-debounce/throttle'
import {instance} from "../../config/axiosConfig";
import ToastBox from "../../components/LIANMAI/Toast/index";
import {connect} from "react-redux";

const testInfo = {
    id: 2,
    tags: [],
    fromFriends: ["帅哥", "电竞高手"],
    text: ""
};

const systemTags = ["产品经理", '学习超人', '大神', '大厨', '大师兄', '跑得快', '长得帅', '家里钱多', '水平高'];
const initial = "Hi!欢迎来到能力图仓库!在这里你可以选择自己想展示在个人能力图上的标签，建立更加立体的形象~";
const tips = "请至少选择三个标签:)";


@withRouter
@connect(
    state => state.user
)
class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: testInfo,
            randomTags: systemTags.slice(0, 8),
            tips: initial,
            tags: [],
            showTips: false,
            onEdit: false,
            text: "",
            onPress: false,
            fromFriends: testInfo.fromFriends.slice(0)
        };
        this.default = systemTags;
        this.nullArr = new Array(6).fill(0);
        // 函数防抖
        this.debounceShowHanlder = throttle(1000, (e) => {
            this.handleShowTips(e);
        });
        this.timeOutEvent = null;
    }

    async handleFromFriends() {
        let res = await instance.post('/my/getAllSkillType', {ID: this.props.id});
        console.log(res);
        if (res.data == null || res.data.ans === "fail") {
            return;
        }
        let tempData = [];
        for (let v of res.data) {
            if ((v.isOther == null || v.isOther == 1) && v.skillType !== "") {
                tempData.push(v.skillType);
            }
        }
        this.setState({
            fromFriends: tempData
        })
    }


    componentWillMount() {
        if (this.state.tags < 3) {
            this.setState({
                showTips: true
            })
        }
        this.handleFromFriends.bind(this)();
    }


    componentDidMount() {
        setTimeout(() => {
            this.setState({
                showTips: false
            })
        }, 3000);
    }


    handleShowTips = () => {
        if (this.state.tags.length < 3 && !this.state.showTips) {
            this.setState({
                showTips: true,
                tips: tips
            }, () => {
                setTimeout(() => {
                    this.setState({
                        showTips: false
                    });
                }, 3500)
            })
        }
        this.handleSendTags.bind(this)();
    };

    handleChooseTag = (v) => {
        let temp = this.state.tags;
        console.log(temp);
        if (temp.indexOf(v) < 0) {
            if (temp.length === 6) {
                temp.shift();
            }
            temp.push(v);
            this.setState({
                tags: temp.slice(0)
            })
        } else {
            let index = temp.indexOf(v);
            temp.splice(index, 1);
            this.setState({
                tags: temp.slice(0)
            })
        }
    };


    // TODO AJAX 处理刷新逻辑
    async handleRefresh() {
        let randomNum = Math.round(Math.random() * 7);
        let newLabels = await instance.post('/my/getRandomLabel', {num: randomNum});
        newLabels = newLabels.data;
        if (newLabels.ans === "failed") {
            ToastBox.error({
                content: "更新失败"
            });
            return;
        }
        this.setState({
            randomTags: newLabels.data.slice(0)
        })
    };

    handleInputTag = (v) => {
        let temp = this.state.tags;
        console.log(temp);
        if (temp.indexOf(v) < 0) {
            if (temp.length === 6) {
                temp.shift();
            }
            temp.push(v);
            this.setState({
                tags: temp.slice(0)
            })
        }
    };

    async handleSendTags() {
        const ans = await instance.post('/my/addSkillTypes', {ID: this.props.id, skillType: this.state.tags});
        if (ans.data.ans === "fail") {
            ToastBox.error({
                content: "更新失败!"
            });
            return;
        }
        ToastBox.success({
            content: "更新成功"
        })

    }

    render() {
        return (
            <div className={style.main}>
                <div
                    className={`
                    ${style.hideTips}
                `}>
                    {this.state.tips}
                </div>
                <div className={style.nav}>
                    <div className={style.back}>
                        <img
                            src={require('../../images/leftBack.jpg')}
                            onTouchStart={() => {
                                this.props.history.goBack();
                            }}
                            alt="back"/>
                        <span className={style.back}>标签</span>
                    </div>
                    <div className={style.right}>
                        <span
                            className={style.confirm}
                            onTouchStart={(e) => {
                                this.debounceShowHanlder(e);
                                // Todo 发送ajax来处理确认回调
                            }}
                        >确认</span>
                    </div>
                </div>

                <div
                    className={`
                        ${style.content}
                        ${this.state.showTips ? style.tipShow : ""}
                        ${!this.state.showTips ? style.tipHide : ""}
                    `}>
                    <div className={style.show}>
                        <h3>我想在能力图上展示</h3>
                        <ul>
                            {this.nullArr.map((v, index) => {
                                return <li
                                    key={v + index}
                                    className={
                                        `${this.state.tags[index] ? style.sub_active : ""}
                                         ${(this.state.onPress && this.state.tags[index]) ? style.shake : ""}`
                                    }
                                    onTouchStart={(e) => {
                                        if (e.target.textContent) {
                                            this.timeOutEvent = setTimeout(() => {
                                                // 处理长按事件
                                                this.timeOutEvent = null;
                                                this.setState({
                                                    onPress: true
                                                })
                                            }, 1500)
                                        }
                                    }}
                                    onTouchEnd={(e) => {
                                        clearTimeout(this.timeOutEvent);
                                        this.timeOutEvent = null;
                                    }}
                                >
                                    {this.state.tags[index] || ""}
                                    <span
                                        style={{
                                            opacity: this.state.tags[index] && this.state.onPress ? 1 : 0
                                        }}
                                        className={style.close}
                                        onTouchStart={() => {
                                            this.setState({
                                                onPress: false,
                                            }, () => {
                                                this.handleChooseTag(this.state.tags[index]);
                                            })
                                        }}
                                    >&times;</span>
                                </li>
                            })}
                        </ul>
                        <div className={style.diy}>
                        <span>
                            自定义 <span
                            className={style.plus}
                            onTouchStart={(e) => {
                                this.setState({
                                    onEdit: !this.state.onEdit
                                })
                            }}
                        ><img src={require('../../images/plus.png')} alt="+"/></span>
                            <input
                                type="text"
                                style={{
                                    width: this.state.onEdit ? "6rem" : "0",
                                    opacity: this.state.onEdit ? "1" : "0",
                                }}
                                value={this.state.text}
                                onChange={(e) => {
                                    this.setState({text: e.target.value})
                                }}
                                placeholder={"新建标签..."}
                                className={style.newTags}/>
                            <img
                                src={require('../../images/check.png')}
                                style={{
                                    width: this.state.onEdit ? "1rem" : "0",
                                }}
                                onTouchStart={() => {
                                    if (this.state.text.length === 0) return;
                                    this.handleInputTag(this.state.text);
                                    this.setState({
                                        onEdit: false,
                                        text: ""
                                    })
                                }}
                                className={style.check}
                                alt="confirm"/>
                        </span>
                        </div>
                    </div>
                    <div className={style.fromFriends}>
                        <h4>来自好友</h4>
                        <ul>
                            {this.state.fromFriends.map((v) => {
                                return <li
                                    className={`
                                        ${this.state.tags.indexOf(v) > -1 ? style.sub_active : "" }
                                    `}
                                    onTouchStart={() => {
                                        this.handleChooseTag(v);
                                    }}>{v}</li>
                            })}
                        </ul>
                    </div>
                    <div className={style.default}>
                        <h4>
                            <span>系统推荐</span>
                            <span onTouchStart={(e) => {
                                this.handleRefresh.bind(this)();
                            }}>
                                <img src={require('../../images/refresh.png')} alt="refresh"/>
                                换一批
                            </span>
                        </h4>
                        <ul>
                            {this.state.randomTags.map((v) => {
                                return <li
                                    key={v}
                                    className={`
                                        ${this.state.tags.indexOf(v) > -1 ? style.sub_active : "" }
                                    `}
                                    onTouchStart={() => {
                                        this.handleChooseTag(v);
                                    }}>{v}</li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}


export default Tags;
