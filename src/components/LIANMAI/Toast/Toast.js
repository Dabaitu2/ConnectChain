/**
 *    Created by tomokokawase
 *    On 2018/8/9
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import style from './toast.scss';

class Toast extends Component {
    render() {
        let {content, type} = this.props;
        return (
            <div className={style.main}>
                <img src={require(`../../../images/${type}.png`)} alt="tipsImg"/>
                <span>{content}</span>
            </div>
        );
    }
}

Toast.propTypes = {
    content: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['alert', 'success', 'warning', 'error']).isRequired
};

Toast.defaultProps = {
    content: "此处应有提示",
    type: 'alert'
};

export default Toast;
