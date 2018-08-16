/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import {changePath} from "../../../redux/actions";
import {withRouter} from "react-router-dom";
import {instance}   from '../../../config/axiosConfig';
import style from './slideBar.scss'

// Todo 这个信息需要后端来提供，放进redux里管理
const NavList = [
    {
        title: "已发布",
        path: "publish",
        hasNews: false
    },
    {
        title: "已回复",
        path: "response",
        hasNews: false
    },
    {
        title: "已转发",
        path: "transfer",
        hasNews: false
    },
];
@withRouter
@connect(
    state => state.user,
    {changePath}
)
class SlideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasNews: false
        }
    }


    async checkHasNews() {
        let ans = await instance.post('/footprint/myAnswer', {ID: this.props.id});
        for (let v of ans.data) {
            if (v.unRead > 0) {
                this.setState({
                    hasNews: true
                });
                return;
            }
        }
    }


    componentWillMount() {
        this.checkHasNews.bind(this)();
    }


    render() {
        return (
            <div className={style.wrap}>
                <ul className={style.main}>
                    {NavList.map((v, index)=>{
                        return (
                            <li
                                key={v.path}
                                onClick={
                                ()=>{
                                    this.props.changePath(v.path);
                                }
                            }>{v.title}<span
                                className={
                                    index == 1 && this.state.hasNews ?
                                        style.red_dot:""}/>
                            </li>)
                    })}
                </ul>
                <div className={`${style.slide_container}`}>
                    <span className={`
                            ${style.slide_hint}
                            ${style[`slide_${this.props.path}`]}
                    `} />
                </div>
            </div>
        );
    }
}


export default SlideBar;
