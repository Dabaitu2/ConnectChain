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
                <img src={require('../../images/BG404.png')} alt="404"/>
            </div>
        );
    }
}


export default ERROR;
