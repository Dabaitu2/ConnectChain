/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './park.scss'
import ParkItems from "../../components/LIANMAI/parkItems/ParkItems";
import {withRouter} from "react-router-dom";
import {instance} from '../../config/axiosConfig'
import {connect} from "react-redux";
import ToastBox from "../../components/LIANMAI/Toast/index";
import ParkTransferItem from "../../components/LIANMAI/ParkTransferItem/ParkTransferItem";
import {scrollLeft} from "../../utils/Animate";
import throttle from 'throttle-debounce/throttle';

import {socket} from '../../App'
import MsgBox from "../../components/LIANMAI/MsgBox/index";




const testInfo = [
    {
        id: 1,
        questionID:1,
        title: "#失物招领# 身份证",
        details: "有谁在综C捡到了我的身份证吗? 马上要买票了，求扩散啊",
        name: "喵喵喵",
        imgUrl: require('../../images/03.jpg'),
        reward: 30,
        tags:["失物招领"],
        time: "2018-07-21T21:03:34.354Z"
    },
    {
        id: 2,
        questionID:2,
        title: "五月天门票耶！有缘人不要错过!",
        details: "因为临时要加班，五月天的演唱会去不了啦，门票急转，小哥哥小姐姐帮帮忙！！",
        name: "EVAN",
        imgUrl: require('../../images/01.jpg'),
        reward: 20,
        tags:["音乐","门票"],
        time: "2018-07-21T13:13:31.354Z"
    },
    {
        id: 3,
        questionID:3,
        title: "健身房卡转手咯",
        details: "有充满爱心的同学帮助贫困大学生" +
                 "圆回家梦的吗?不要998只要450，海" +
                 "力天穹健身房健身卡拿回家。健身房就" +
                 "在将按西南门对面的小区内，内部还有"+
                "许多先进高科技健身器材等你来体验，" +
                "机不可失，时不再来，赶紧拿起电话订购吧!",
        name: "Alan",
        imgUrl: require('../../images/02.png'),
        reward: 50,
        tags:["物品交易"],
        time: "2018-08-01T10:13:31.354Z"
    },
];

@withRouter
@connect(
    state=>state.user
)
class Park extends Component {
    constructor(props) {
        super(props);
        this.state = {
            onEdit: false,
            testInfo: testInfo,
            info: [],
            show: true,
            onSearch: false,
            searchResult: [],
            searchUsers: [],
            tips: "搜索",
            lastY: 0,
            showHover: true
        }
    }


    componentWillUnmount() {
        socket.removeEventListener('sendMessage');
        this.refs.main.removeEventListener("scroll", this.handleScroll);
    }


    componentDidMount() {
        this.refs.main.addEventListener("scroll", (e)=>{
            this.throttleScroll(e)
        });
    }

    handleScroll = (e) => {
        if(this.state.lastY > e.target.scrollTop) {
            this.setState({
                showHover: true,
                lastY: e.target.scrollTop
            })
        } else {
            this.setState({
                showHover: false,
                lastY: e.target.scrollTop
            })
        }
    };

    throttleScroll = throttle(300, (e)=>{
        this.handleScroll(e)
    });




    componentWillMount() {
        let {id, history} = this.props;

        setTimeout(()=>{
            socket.emit('addUser', id);
            socket.on('sendMessage', (data) => {
                console.log(data);
                if(data === "成功加入") return;
                MsgBox.alert({
                    src: data.figureurl,
                    content: data.answerer+"："+data.detail.substring(0, 15)+"...",
                    dialogueID: data.dialogueID,
                    history: history
                });
            });
        }, 500);


        instance.post('/questions/getAllFriendQuestions', {ID: id}).then((res)=>{
            if (res.data !== "" && res.data.ans !== 'no data') {
                let info = [];
                for (let v of res.data) {
                    if(v==null ||
                        v.quizzerID == this.props.user.id ||
                        v.forwarderID == v.quizzerID) continue;
                        let temp = {
                        id: v.quizzerID,
                        questionID: v.questionID,
                        title: v.title || "测试标题",
                        details: v.content,
                        name: v.nickname,
                        imgUrl: v.figureurl,
                        reward: v.token,
                        tags:v.label,
                        time: v.time,
                        type: v.type,
                        forwarderNickname: v.forwarderNickname || "",
                        searchResult: [],
                        searchUsers: [],
                        status: v.status,
                        previousID: v.forwarderID
                    };
                    info.push(temp);
                }
                this.setState({
                    info: info.slice(0)
                })
            } else {
                console.warn("no data!");
            }
        })
    }

    async handleIconSearch () {
        this.setState({
            searchResult: [],
            searchUsers: [],
            onSearch: true,
        });
        let flag = this.WrapSearchResult.bind(this)();
        if(flag) {
            ToastBox.success({
                content: "搜索完毕!"
            });
        } else {
            ToastBox.error({
                content: "搜索失败!"
            });
        }
    }

    async handleSearchClick (){
        let {skillType, tips, onSearch} = this.state;
        if (tips === "搜索" && (!skillType || !skillType.length)) {
            ToastBox.warning({
                content: "请输入再搜索"
            });
            return;
        }
        this.setState({
            onSearch: !onSearch,
            tips: tips === "搜索" ? "取消" : "搜索",
            skillType: tips === "搜索" ? skillType : ""
        }, ()=>{
            if (tips === "取消") {
                this.refs.search.value = "";
                this.setState({
                    searchResult: [],
                    searchUsers: []
                })
            } else {
                let flag = this.WrapSearchResult.bind(this)();
                if(flag) {
                    ToastBox.success({
                        content: "搜索完毕!"
                    });
                } else {
                    ToastBox.error({
                        content: "搜索失败!"
                    });
                }
            }
        })
    };

    async WrapSearchResult (){
        let id = this.props.id;
        let {skillType} = this.state;
        let rst = await instance.post('/questions/search', {ID: id, skillType: skillType});
        if (!rst.data[0] && !rst.data[1]) {
            ToastBox.warning({
                content: "未搜索到信息"
            });
            return false;
        }

        let searchResult = [];
        if(rst.data[0]) {
            for (let v of rst.data[0]) {
                if (v == null) continue;
                let temp = {
                    id: v.quizzerID,
                    questionID: v.questionID,
                    title: v.title || "测试标题",
                    details: v.content,
                    name: v.nickname,
                    imgUrl: v.figureurl,
                    reward: v.token,
                    tags: v.label,
                    time: v.time,
                    type: v.type,
                    forwarder: v.forwarderNickname || "",
                    searchResult: [],
                    searchUsers: []

                };
                searchResult.push(temp);
            }
        }


        this.setState({
            searchResult: searchResult || [],
            searchUsers: rst.data[1] || []
        });
        return true;
    };

    searchZone = () => {
        let {searchResult}    = this.state;
        return (
            <div className={style.content}>
                {
                    this.SearchUsersZone()
                }
                {searchResult.length > 0 ? searchResult.map(v=>(
                        <ParkItems info={v} key={"search"+v.questionID} />
                )) : <div className={style.noMsg}>
                    <img src={require('../../images/404.png')} alt="404"/>
                    <div>抱歉，没有搜索到相关消息</div>
                </div>}
            </div>
        )
    };

    SearchUsersZone = () => {
        let {searchUsers} = this.state;
        return (
            <div className={style.UsersList}>
                <span>好友</span>
                <div className={style.frame}>
                    {searchUsers.length > 0 ?
                <ul ref={'userList'}>
                    {
                        searchUsers.map(v=>(
                            <div>
                                <li className={style.UserAvatar}>
                                    <img src={v.figureurl} alt={v.name}/>
                                </li>
                                <span>{v.nickname}</span>
                            </div>
                        ))
                    }
                </ul> : <div>没有符合当前标签的好友!</div>}
                </div>
                <span className={style.moreUsers} onClick={()=>{
                    this.state.searchUsers.length > 5 ?
                    scrollLeft(this.refs.userList.scrollLeft + 56, this.refs.userList, 400, true, this.refs.userList.scrollLeft):
                        ()=>{};

                    // this.refs.userList.scrollLeft += "56";
                }}>
                    <img src={require('../../images/rightBack.png')} alt="more"/>
                </span>
            </div>
        )
    };


    timeLine = () => {
        let {info}    = this.state;
        return (
            <div className={style.content}>
                {info.map(v=>(
                    v.type === 0 ?
                        <ParkItems key={"timeline"+v.questionID} info={v} /> : v.name != v.forwarder ?
                        <ParkTransferItem key={"timeTransline"+v.questionID} info={v} /> : null
                ))}
                <div className={style.end}>没有更多消息了</div>
            </div>
        )
    };


    render() {
        let {onSearch, tips}    = this.state;
        let {history} = this.props;
        return (
            <div className={style.main} ref={'main'}>
                <div className={style.searchBar}>
                    <input type="text"
                           onChange={(e)=>{
                               this.setState({
                                   skillType: e.target.value
                               })
                           }}
                           ref={'search'}
                           placeholder={'试试搜索标签吧'}/>
                    <img src={require('../../images/search.png')}
                         onClick={this.handleIconSearch.bind(this)}
                         className={style.searchIcon}
                         alt="search"/>
                    <span onClick={()=>{
                        this.handleSearchClick.bind(this)();
                    }}>{tips}</span>
                </div>
                {onSearch ? this.searchZone() : this.timeLine() }
                <div className={`${style.hoverBtn} ${this.state.showHover ? style.showHover : style.hideHover}`}
                     style={{
                         width: this.state.showHover ? "3.5rem" : 0,
                         height: this.state.showHover ? "3.5rem" : 0,
                         transition: ".3s linear"
                     }}
                     onTouchStart={
                    ()=>{
                        history.push('/newQuestion');
                    }
                }>
                    <img src={require('../../images/BIGplus.png')}
                         alt="plus"/>
                </div>
            </div>
        );
    }
}

Park.propTypes = {};

export default Park;
