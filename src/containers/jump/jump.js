/**
 *    Created by tomokokawase
 *    On 2018/7/30
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import Cookies from 'js-cookie';
import {withRouter} from "react-router-dom";
import {logID} from "../../redux/actions";
import {connect} from "react-redux";
import style from './jump.scss';

@connect(
    state => state.user,
    {logID}
)
@withRouter
class Jump extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url:"",
            ID: 0,
        }
    }

    // TODO 没有url说明是主页跳转，需要在主页设置checkID
    componentWillMount() {
        if (Cookies.get('url')!==null && Cookies.get('url')!==undefined) {
            this.setState({
                url: Cookies.get('url').replace('"[', "").replace(']"',"").trim().split(".com/")[1],
                ID: window.location.search.split("ID=")[1]});
            Cookies.set('ID',window.location.search.split("ID=")[1]);
        } else {
            this.setState({
                url: '/center/my',
                ID: window.location.search.split("ID=")[1]});
            Cookies.set('ID',window.location.search.split("ID=")[1]);
        }
        this.props.logID(window.location.search.split("ID=")[1]);
    }


    componentDidMount() {
        setTimeout(()=>{
            if(this.state.ID == null || this.state.ID == false || this.state.ID == 0 || this.state.ID == undefined) {
                this.props.history.push('/index');
                return;
            }
            if (this.state.url === '/center/my') {
                this.props.history.push(this.state.url);
                return;
            }
            let lastOne = this.state.url.split("&ID=")[1];
            let prelastone = this.state.url.split('&previousID=')[1].split('&ID=')[0];
            if (lastOne == this.state.ID || prelastone == this.state.ID) {
                console.log("存在重复");
                let newUrl = this.state.url.split('&ID=')[0]+ "&ID=" + this.state.ID;
                this.props.history.push(newUrl);
                return;
            }
            console.log("没有重复");
            let newUrl = this.state.url.split('&previousID=')[0] + "&previousID=" + lastOne + "&ID=" + this.state.ID;
            this.props.history.push(newUrl);
        }, 200)
    }


    render() {
        return (
                <img src={require('../../images/BGloading.png')} className={style.main} alt="loading"/>
        );
    }
}


export default Jump;
