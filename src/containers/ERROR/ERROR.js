/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './error.scss'

class ERROR extends Component {
    render() {
        return (
            <div className={style.main}>
                您请求的资源不存在!
            </div>
        );
    }
}


export default ERROR;
