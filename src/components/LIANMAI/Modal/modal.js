/**
 *    Created by tomokokawase
 *    On 2018/7/25
 *    阿弥陀佛，没有bug!
 */
import React, {Component}   from 'react';
import style                from './modal.scss';

class Modal extends Component {


    render() {
        let {icon, children, prompt, handleShow, handleConfirm, show, handleLeave} = this.props;
        icon = require(`../../../images/${icon}.png`);
        return (
            <div className={`
                ${style.wrapper}
                ${this.props.leave ? style.leave : ""}
               `}
                 ref={"layer"}
                 onTouchStart={(e) => {
                     e.stopPropagation();
                     if (this.refs.layer === e.target) {
                         handleLeave();
                         setTimeout(() => {
                             handleLeave();
                             handleShow();
                         }, 1000);
                     }
                 }}
                 style={{
                     display: show ? "block" : "none",
                 }}>
                <div className={style.main}>
                    <div className={style.content}>
                        <div>
                            <img src={icon} alt={"icon"}/>
                        </div>
                        <div>
                            {children}
                        </div>
                    </div>
                    <div className={style.bottom}>
                        <span
                            onTouchStart={() => {
                                handleConfirm(this.props.num);
                                handleLeave();
                                setTimeout(() => {
                                    handleLeave();
                                    handleShow();
                                }, 1000);

                            }}
                        >
                            {prompt ? prompt : "确认"}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}


export default Modal;
