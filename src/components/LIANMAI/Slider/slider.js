/**
 *    Created by tomokokawase
 *    On 2018/7/24
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './slider.scss';

class Slider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            percentage: 0,
            hasTouch: false,
            X: 0,
            clientWidth: 0,
            offsetLeft: 0,
            offsetRight: 0,
            num: 1,
            unit: 0,
            onTouch: false
        }
    }


    componentDidMount() {
        let line = this.refs.line.getBoundingClientRect();
        /**
         *  返回的left是矩形dom元素左边到视口左侧的距离
         *           right是矩形的右边到视口左侧的距离
         *           top和bottom则是距上端的距离
         * */
        this.setState({
            clientWidth: line.width,
            offsetLeft: line.left,
            offsetRight: line.right,
            unit: line.width / 15
        });
    }

    /**
     *  screenX  事件发生时鼠标指针相对于屏幕的水平坐标
     *  pageX    鼠标指针距离文档（HTML）的左上角距离，不会随着滚动条滚动而改变
     *  clientX  鼠标指针距离可视窗口(不包括上面的地址栏和滑动条)的距离，会随着滚动条滚动而改变
     *  offsetX
     *
     *
     * */
    render() {
        let {percentage, offsetLeft, offsetRight} = this.state;
        return (
            <div>
                <div className={style.main}>
                    <div className={style.slideLine} ref={'line'}/>
                    <span
                        style={{
                            transform: `translateX(${percentage}px)`,
                            width: "2.2rem",
                            height: "2.2rem",
                            backgroundColor: this.state.onTouch ? "rgba(166, 217, 254, 0.7)" : "transparent",
                            justifyContent: "center",
                            alignItems: "center",
                            lineHeight: "2.5rem",
                            position: "relative",
                            left: "1.4rem",
                            transition: "background-color .2s linear",
                            textAlign: "center",
                            borderRadius: "50%",
                            zIndex: 200
                        }}
                        onTouchMove={(e) => {
                            let newX = e.touches[0].clientX;
                            if (newX < offsetLeft) {
                                newX = offsetLeft;
                            }
                            if (newX > offsetRight) {
                                newX = offsetRight;
                            }
                            let percentage = newX - this.state.offsetLeft;
                            let num = Math.round(percentage / this.state.unit);
                            percentage = num * this.state.unit;
                            this.setState({
                                percentage: percentage,
                                num: num,
                                onTouch: true
                            },()=>{
                                this.props.handleDays(num);
                            })
                        }}
                        onTouchEnd={() => {
                            this.setState({
                                onTouch: false
                            })
                        }}
                    >
                    <span
                        className={style.choseDot}
                    >
                     <span className={style.hintTips}>
                         {this.state.num>1 && this.state.num<15?this.state.num:''}
                         </span>
                    </span>
                </span>
                </div>
                <div className={style.hintList}>
                    <span>1</span>
                    <span style={{
                        position: "relative",
                        left: "2.2rem"
                    }}>15 天</span>
                </div>
            </div>
        );
    }
}


export default Slider;
