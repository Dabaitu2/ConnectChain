/**
 *    Created by tomokokawase
 *    On 2018/8/12
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import style from './Msg.scss';

class Msg extends Component {
    render() {
        let {content, type, src, history, dialogueID} = this.props;
        return (
            <div className={style.main}>
                <img src={require(`../../../images/${type}.png`)} alt="tipsImg"/>
                <div>
                    <div className={style.avatar}>
                        <img src={src} alt="avatar"/>
                    </div>
                    <p>
                    {content}
                    </p>
                    <span onClick={()=>{
                        history.push({
                            pathname: `/Chat`,
                            query: {
                                dialogueID: dialogueID,
                            }
                        })
                    }}>去回应</span>
                </div>
                <span onClick={()=>{
                    this.props.close();
                }}>&times;</span>
            </div>
        );
    }
}

Msg.propTypes = {
    content: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['alert', 'success', 'warning', 'error']).isRequired
};

Msg.defaultProps = {
    content: "此处应有提示",
    type: 'alert'
};

export default Msg;
