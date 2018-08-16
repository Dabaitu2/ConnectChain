import React, {Component} from 'react';
import PropTypes from 'prop-types';
import style from './betterModal.scss';
import QueueAnim from 'rc-queue-anim';
import {CSSTransitionGroup} from "react-transition-group";

// 这个类只是方便对body进行状态分割
const modalOpenClass = 'modal-open';

const toggleBodyClass = isOpen => {
    const body = document.body;
    if (isOpen) {
        body.classList.add(modalOpenClass);
    } else {
        body.classList.remove(modalOpenClass);
    }
};


class BetterModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: props.isOpen || false
        };
        toggleBodyClass(props.isOpen);
    }


    componentWillReceiveProps(nextProps) {
        if('isOpen' in nextProps) {
            console.log("显示模态框");
            this.setState({
                isOpen: nextProps.isOpen
            })
        }
    }

    // 关闭弹层函数
    close = () => {
        console.log("内部close被触发");
        this.setState({
            isOpen: false
        });
        toggleBodyClass(false);
        // this.props.onClose();
    };
    // 点击确认回调函数
    onOkClick = () => {
        // 用户传入的逻辑
        this.props.onOk();
        this.close();
    };
    // 点击取消的回调函数
    onCancelClick = () => {
        this.props.onCancel();
        this.close();
    };

    onClickMask = (e) => {
        if (this.props.maskClosable) {
            if(e.target === this.container) this.close();
        }
    };


    container = null;


    render() {
        const {
            title,
            children,
            className,
            okText,
            cancelText,
            type
        } = this.props;

        console.log("重新渲染");
        return (
            // 允许自定义外部模态框的样式
                    <CSSTransitionGroup
                        transitionName={'modal-fade'}
                        transitionEnterTimeout={300}
                        transitionLeaveTimeout={300}
                    >
                {this.state.isOpen ?
                    <div
                        className={`${style.container} ${className}`}
                         ref={c => this.container = c}
                         onClick={(e) => this.onClickMask(e)}>
                        <div className={`${style.body}`}>
                            <div className={`${style.title} ${style[type]}`}>{title}</div>
                            <div className={`${style.content}`}>
                                {children}
                            </div>
                            <div className={`${style.footer}`}>
                                <button className={`${style.ok_btn}`} onClick={this.onOkClick}>{okText}</button>
                                <button className={`${style.cancel_btn}`}
                                        onClick={this.onCancelClick}>{cancelText}</button>
                            </div>
                        </div>
                    </div>
                    :null}
                </CSSTransitionGroup>
        );
    }
}

BetterModal.propTypes = {
    isOpen      : PropTypes.bool.isRequired,
    title       : PropTypes.string.isRequired,
    children    : PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
    className   : PropTypes.string,
    maskClosable: PropTypes.bool,
    onCancel    : PropTypes.func,
    onOk        : PropTypes.func,
    okText      : PropTypes.string,
    cancelText  : PropTypes.string,
    type        : PropTypes.oneOf(['alert', 'confirm', 'error', 'success','defaults']),
    onClose     : PropTypes.func
};

BetterModal.defaultProps = {
    className: "",
    maskClosable: true,
    onCancel: () => {},
    onOk: () => {},
    okText: "确认",
    cancelText: '取消',
    type: 'defaults',
    onClose: () => {}
};

export default BetterModal;
