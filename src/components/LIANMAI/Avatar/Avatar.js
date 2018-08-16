/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './avatar.scss'

const defaultImg = require('../../../images/01.jpg');


/**
 *
 *  封装用户头像格式的组件
 *  @props {string} width 图片宽度
 *  @props {string} height 图片高度
 *  @props {string} url    require格式或者网络格式图片
 *
 *  @variation defaultImg   预设图片
 *
 * */
class Avatar extends Component {
    render() {
        return (
            <div className={style.main}
                 style={{
                     width:  this.props.width || "2rem",
                     height: this.props.height || "2rem",
                 }}
            >
                <img src={this.props.url || defaultImg} alt="avatar"/>
            </div>
        );
    }
}


export default Avatar;
