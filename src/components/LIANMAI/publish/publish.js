/**
 *    Created by tomokokawase
 *    On 2018/7/23
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import PublishItem from "./publishItem";
import {instance} from '../../../config/axiosConfig'
import {connect} from "react-redux";
import {logID} from "../../../redux/actions";
import style from './publishItem.scss';


@connect(
    state => state.user,
    {logID}
)
class Publish extends Component {

    constructor(props) {
        super(props);
        this.state = {
            info: []
        }
    }


    componentWillMount() {
        this.setState({
            ID: this.props.id || 4 //todo 后备删除
        },()=>{
            instance.post('/footprint/myRelease', {ID:this.props.id}).then((res)=>{
                console.log(res);
                if ( !res.data[1] ) {return;}
                let questions = res.data[1];
                let info = [];
                if(questions == null || questions.length < 1) return;
                for (let v of questions) {
                    let temp = {
                        title: v.title,
                        transferNum: v.forwardNum || 0,
                        answer: v.answer,
                        status: v.status,
                        id: v.questionID,
                        time: v.time
                    };
                    info.push(temp);
                }
                this.setState({
                    info: info
                })
            })
        })
    }


    render() {
        return (
            <div className={'tab'}>
                {this.state.info.length > 0 ? this.state.info.map((v)=>{
                    return <PublishItem info={v} key={v.id}/>
                }) : <div className={style.empty} >
                    <img src={require('../../../images/empty.png')} alt="没有数据"/>
                    <h4>啥都没有</h4>
                </div>}
            </div>
        );
    }
}

export default Publish;
