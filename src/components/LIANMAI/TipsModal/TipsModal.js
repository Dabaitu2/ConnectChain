/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component}   from 'react';
import style                from './TipsModal.scss';
import propTypes            from 'prop-types';

class TipsModal extends Component {


    render() {
        let {
            icon,
            children,
            prompt,
            handleConfirm,
            show,
            handleBack,
            } = this.props;
        icon = require(`../../../images/${icon}.png`);
        return (
            <div className={`
                ${style.wrapper}
                ${this.props.leave ? style.leave : ""}
               `}
                 ref={"layer"}
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
                        <div className={style.Cancel}>
                        <span
                            onTouchStart={() => {
                                handleBack();
                            }}
                        >
                            {prompt ? prompt : "取消"}
                        </span>
                            {/*<img*/}
                                {/*src={require('../../../images/close.png')}*/}
                                {/*alt="check"*/}
                                {/*style={{*/}
                                    {/*height: "1.5rem",*/}
                                    {/*verticalAlign: "top"*/}
                                {/*}}*/}
                            {/*/>*/}
                        </div>
                        <div className={style.Confirm}
                             onClick={(e) => {
                                 // e.stopPropagation();
                                 handleConfirm();
                             }}
                        >
                        <span
                        >
                            {prompt ? prompt : "确认"}
                        </span>
                            {/*<img*/}
                                {/*src={require('../../../images/check.png')}*/}
                                {/*alt="check"*/}
                                {/*style={{*/}
                                    {/*height: "1.5rem",*/}
                                    {/*verticalAlign: "top"*/}
                                {/*}}*/}
                            {/*/>*/}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
TipsModal.propTypes = {
    icon: propTypes.string.isRequired,
    children: propTypes.oneOfType([propTypes.element, propTypes.string]).isRequired,
    show: propTypes.bool.isRequired
};

TipsModal.defaultProps = {
    icon : "success",
    children : "您的模态框内容",
    handleShow: ()=>{},
    handleConfirm: ()=>{},
    show: true,
    handleLeave: ()=>{}
};

export default TipsModal;
