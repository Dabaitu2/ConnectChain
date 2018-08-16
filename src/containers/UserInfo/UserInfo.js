/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './UserInfo.scss'
import Radar from "../../components/LIANMAI/Radar/Radar";
import {calcGaptoToday, mockTime, transferTZ} from "../../utils/dates";
import {transferGraphData} from "../../utils/GraphTools";
import MyItem from "../../components/LIANMAI/myItem/myItem";
import {instance} from  '../../config/axiosConfig';
import {connect} from "react-redux";
import ToastBox from "../../components/LIANMAI/Toast/index";

const activityTags = ["打牌","抽烟",'喝酒',
    '带孩子','睡觉','挣钱',
    '败家','打怪兽','当怪兽',
    '修电脑','炒菜','煮菜', "炖菜","烧菜","蒸菜","凉拌菜","烤肉","吃饭","踢球"];

const TestData = {
    choosen: 12,
    publish: 30,
    reward: 60
};

const TestSourceData = [
    { item: activityTags[0], mark: Math.round(Math.random() * 3 + 2) },
    { item: activityTags[1], mark: Math.round(Math.random() * 3 + 2) },
    { item: activityTags[2], mark: Math.round(Math.random() * 3 + 2) },
    { item: activityTags[3], mark: Math.round(Math.random() * 3 + 2) },
    { item: activityTags[4], mark: Math.round(Math.random() * 3 + 2) },
    { item: activityTags[5], mark: Math.round(Math.random() * 3 + 2) },
];

const User = {
    name: "云棠",
    id:"2",
    activity: [
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
        { tag: activityTags[Math.round(Math.random() * 19)], mark: activityTags[Math.round(Math.random() * 7)] },
    ],
    imgUrl : require('../../images/02.png'),
    news : [
        {
            type: "publish",
            details: "望江附近租房求推荐，希望离地铁站近，有独卫~",
            answer: "3",
            transfer: "17",
            timeStamp: mockTime(22)
        },
        {
            type: 'response',
            details: "因为临时有事要加班，五月天的演唱会去不了了, 门票急转，小哥哥小姐姐们帮帮忙!!",
            finishedTime: calcGaptoToday(mockTime(3)) / 1000,
            timeStamp: mockTime(40)
        },
        {
            type: 'response',
            details: "因为临时有事要加班，五月天的演唱会去不了了, 门票急转，小哥哥小姐姐们帮帮忙!!",
            finishedTime: calcGaptoToday(mockTime(3)) /1000,
            timeStamp: mockTime(40)
        }
    ]
};

@connect(
    state => state.user
)
class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo : {},
            tags:[]
        }
    }

    // todo 接受ajax方法获取news
    componentWillMount() {
        this.getHome();
        // this.getLabels.bind(this)();
    }


    componentWillUnmount() {
        this.setState({
            userInfo : null
        })
    }

    getHome = () => {
        // todo 记得恢复，测试
        instance.get('/my/getHome?ID='+this.props.id).then((res)=>{
        //     instance.get('/my/getHome?ID='+2).then((res)=>{

            let user = {
                avatar: res.data[0].figureurl,
                name: res.data[0].nickname,
                status: "/初来乍到/",
            };
            let publishList = [];
            for (const v of res.data[1]) {
                publishList.push({
                    type: "publish",
                    details: v.content,
                    answer: v.answer instanceof Array ? v.answer.length : 1,
                    transfer: v.forwardNum,
                    timeStamp: transferTZ(v.time)
                });
            }

            let responseList = [];
            for (const v of res.data[2]) {
                responseList.push({
                    type: 'response',
                    details: v.questionContent,
                    finishedTime: calcGaptoToday(transferTZ(v.cutTime)) /1000 >= 0 ? 0 : -calcGaptoToday(transferTZ(v.cutTime)) /1000,
                    timeStamp: transferTZ(v.cutTime)
                })
            }
            console.log(responseList);

            this.setState({
                user: user,
                credit: res.data[0].credit.toFixed(1),
                name: res.data[0].nickname
            } , ()=>{
                this.setState({
                    userInfo : User
                });
            });

            if (res.data[0].skill == null || res.data[0].skill.length === 0) {
                return;
            }
            let tempData = [];
            for(const v of res.data[0].skill) {
                if(v.isUse == 1) {
                    tempData.push({
                        item: v.skillType,
                        mark: v.count
                    });
                }
            }
            this.setState({
                tags: tempData.slice(0),
                news: [...publishList, ...responseList]
            })
        })
    };

    // 包装收到的对象
    generateData = (User) => {
        User.activity = User.activity.map((v)=>{
            return transferGraphData(v);
        });
        User.news.forEach((v)=>{
            v.name = User.name;
            v.imgUrl = User.imgUrl;
        });
        return User;
    };

    render() {
        return (
            <div className={style.main}>
                <div className={style.headerBg} />
                <div className={style.myDetails}>
                    <div className={style.upper}>
                        <div className={style.avatar}>
                            <img src={(this.state.user && this.state.user.avatar) || ""} alt="avatar"/>
                        </div>
                        <div className={style.userName}>
                            { (this.state.user && this.state.user.name) || "请稍等"}
                        </div>
                        <div className={style.credit}>
                            <img src={require('../../images/daimond.png')} alt="credit"/>
                            { (this.state.credit && this.state.credit > 0) ? this.state.credit : '暂无评分'}
                        </div>
                    </div>
                    <div className={style.data}>
                        <div><span className={style.number}>{TestData.choosen}</span><span>被采纳</span></div>
                        <div><span className={style.number}>{TestData.publish}</span><span>发布</span></div>
                        <div><span className={style.number}>{TestData.reward}<span>币</span></span><span>奖励</span></div>
                    </div>
                    <div className={style.Radar}>
                        <Radar sourceData={this.state.tags.length>3 ? this.state.tags : TestSourceData}/>
                    </div>
                </div>
                <div className={style.trends}>
                    <span className={style.trendshead}>动态</span>
                    { this.state.news ? this.state.news.map(v=>(
                        <MyItem info={v} name={this.state.name} img={this.state.user.avatar} />
                    )) : ""}
                </div>
            </div>
        );
    }
}


export default UserInfo;
