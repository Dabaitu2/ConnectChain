/**
 *    Created by tomokokawase
 *    On 2018/8/17
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './friends.scss';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {instance} from '../../config/axiosConfig';
import ToastBox from "../../components/LIANMAI/Toast/index";

@withRouter
@connect(
    state => state.user
)
class MyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info: []
        }
    }


    componentWillMount() {
        this.getFriendsList.bind(this)();
    }

    async getFriendsList () {
        try {
            let rst = await instance.post('/my/friends', {ID: this.props.id});
            if (rst.ans === "error") {
                ToastBox.error({
                    content: "from server: 获取好友列表失败!"
                });
                return;
            }
            if (rst.data != null) {
                this.setState({
                      info: rst.data.slice(0)
                });
                console.log(rst.data);
            }
        } catch (err) {
            ToastBox.error({
                content: "获取好友列表失败!"
            })
        }

    }


    render() {
        let {history} = this.props;
        return (
            <div className={style.main}>
                <div className={style.nav}>
                    <div className={style.back} onTouchStart={history.goBack}>
                        <img src={require('../../images/leftBack.jpg')} alt="back"/>
                        <span>我的好友</span>
                    </div>
                </div>
                <div className={style.content}>
                    <ul>
                    {this.state.info.length ? this.state.info.map((v, index)=>{
                        return (<li onClick={()=>{
                            history.push(`/UserInfo/${v.ID}`);
                        }}>
                                <div className={style.avatar}>
                                    <img src={v.figureurl} alt="avatar"/>
                                </div>
                            <span>{v.nickname}</span>
                            <div className={style.seeMore}>
                                <img  src={require('../../images/rightBack.png')} alt="go"/>
                            </div>
                        </li>)
                    }):""}
                    </ul>
                </div>

            </div>
        );
    }
}


export default MyComponent;
