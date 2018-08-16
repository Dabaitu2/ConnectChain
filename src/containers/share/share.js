/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './share.scss';
import Graph from "../../components/LIANMAI/Graph/graph";
import {instance} from '../../config/axiosConfig';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {logID, registUrl} from "../../redux/actions";
import Cookies from 'js-cookie';
import {initWechat} from "../../config/weChatShare";


const Info = {
    id: 2,
    username: "Alan Walker",
    imgUrl: require('../../images/02.png'),
    detail: "有人想要kindle paperWhite么，公司抽奖抽中的，然而我已经有一个了，发出来转卖咯~"
};


@withRouter
@connect(
    state => state.user,
    {registUrl, logID}
)
class Share extends Component {
    constructor(props) {
        initWechat();
        super(props);
        this.state = {
            info: Info,
            qid: 0,
        }
    }

    /**
     * 向服务器请求数据并渲染
     *
     * */
    getInfo = (questionID, previousID) => {
        instance.post(`/questions/questionDetail`,{
            questionID: questionID,
            previousID: previousID,
            ID: this.props.id
        }).then((res) => {
            console.log(res);

            if(res.data.ans==="error") {
                alert("您访问的转发路径并不存在!跳转到主页");
                this.props.history.push('/center/my');
            }

            let content  = res.data[0].content;
            let nickname = res.data[1][0].nickname;
            let imgList   = [];
            for (let i of res.data[1]) {
                imgList.push(i);
            }
            let info = {};
            info.imgUrl = res.data[1][0].figureurl;
            info.id = res.data[0].questionID; // 问题的ID
            info.detail = content;
            info.username = nickname;
            console.log(imgList);
            this.setState({
                imgList: imgList.slice(0),
                info: info,
                previousID: previousID,
                questionID: questionID,
                quizzer: res.data[0].quizzerID
            });

        })
    };

    /**
     *  从跳转来的history参数或者url直接解析需要的url
     *  设置进cookies存储
     * */
    saveUrl = () => {
        let url = "";
        let location = this.props.history.location;
        if (location.query != null) {
            url = window.location.href;
            url += "?questionID=";
            url += location.query['questionID'].toString();
            url += "&previousID=";
            url += location.query['previousID'].toString();
        } else {
            url = window.location.href.split('&from=')[0];
        }
        Cookies.set('url', url);
        return url;
    };

    /**
     *
     * 根据页面参数解析内容
     * 来向服务器请求数据
     * 渲染页面
     *
     * */
    InitPages = () => {
        console.log(window.location.search);
        let url = window.location.search.split("&from=")[0];
        let questionID  = url.split("&")[0].split("=")[1];
        let previousID  = url.split("&")[1].split("=")[1];
        this.setState({
            qid: questionID,
        });
        this.getInfo(questionID, previousID);
    };


    componentWillMount() {
        this.handleCheck();
    }

    /**
     *   saveUrl => getStatus => failed  => no ID    => Index
     *                        => has ID  => checkID  => success => keep alive => getInfo => showImage
     *                                               => failed  => Index
     *                        => success => +ID      => push    => getInfo
     * */

    async handleCheck() {
        this.saveUrl();
        let status = await instance.get('/login/getStatus');
        if (status.data.ans !== "success") {
            // this.props.logID(2);
            let ID = (this.props.id);
            if (ID === 0) {
                this.props.history.push('/index');
                return;
            }
            this.InitPages();
        } else {
            this.InitPages();
        }
    };

    render() {
        return (
            <div className={style.main}>
                <div className={style.head}>
                    <div className={style.left}>
                        <div className={style.avatar}>
                            <img
                                src={this.state.info.imgUrl}
                                alt="imgUrl"/>
                        </div>
                    </div>
                    <div className={style.right}>
                        <h3>{this.state.info.username}</h3>
                        <div>
                            {this.state.info.detail}
                        </div>
                    </div>
                </div>
                <div className={style.content}>
                    {this.state.imgList ?
                        <Graph imgList={this.state.imgList}/> : ""}
                </div>
                <img
                    src={require("../../images/jumpBack.jpg")}
                    width={80}
                    onTouchStart={() => {
                        this.props.history.push({
                            pathname: `/center/my`,
                            query: {
                                ID: this.props.id
                            }
                        });
                    }}
                    className={style.goBack}
                     />
                <div className={style.bottom}>
                    <div className={style.answer}>
                        <span
                            onTouchStart={() => {
                                this.props.history.push({
                                    pathname: `/Chat`,
                                    query: {
                                        questionID: this.state.qid, //问题ID
                                        answerer: this.props.id, // 回答者ID
                                        quizzer: this.state.quizzer, // 提问者ID
                                        source: this.state.previousID
                                    }
                                })
                            }}>
                            我来解答
                            <img src={require('../../images/answer.png')} alt="ans"/>
                        </span>
                    </div>
                    <div className={style.transfer}>
                        <span>
                            帮忙转发
                            <img src={require('../../images/transfer.png')} alt="trans"/>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}


export default Share;
