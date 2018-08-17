/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import Avatar from "../Avatar/Avatar";
import style from './graph.scss';


// canvas polyfill
function getPixelRatio(context) {
    let backingStore = context.backingStorePixelRatio
        || context.webkitBackingStorePixelRatio
        || context.mozBackingStorePixelRatio
        || context.msBackingStorePixelRatio
        || context.oBackingStorePixelRatio
        || context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
};

// 绘制圆形图片
function circleImg(ctx, img, x, y, r) {
    let d =2 * (r);
    let cx = x + r;
    let cy = y + r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore();

}


const testInfo = [
    require("../../../images/03.jpg"),
    require("../../../images/01.jpg"),
    require("../../../images/02.png"),
    require("../../../images/01.jpg"),
    require("../../../images/03.jpg"),

];



class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: this.props.imgList.slice(0),
            imgList: []
        }
    }


    /**
     *
     *
     *
     *
     * */
    drawStars = (n, count) => {
        if(count === 0) {
            let src = this.state.imgList;
            let c   = document.getElementById("myCanvas");

            let ctx     = c.getContext("2d");
            let ratio   = getPixelRatio(ctx);

            let originWidth     = c.width;
            let originHeight    = c.height;

            c.width     = ratio * originWidth;
            c.height    = ratio * originHeight;

            if (--n <= 0) {
                this.finishLastCircle(ctx);
                return;
            }
            circleImg(ctx, src[0], 60, 20, 25);

            ctx.closePath();
            ctx.save();
            ctx.moveTo(110, 45);
            ctx.lineTo(200, 85);
            this.setCanvasStyle(ctx);

            circleImg(ctx, src[1], 200, 60, 25);
            if (--n <= 0) {
                this.finishLastCircle(ctx);
                return;
            }

            ctx.closePath();
            ctx.save();
            ctx.moveTo(250, 85);
            ctx.lineTo(320, 55);
            this.setCanvasStyle(ctx);
            circleImg(ctx, src[2], 320, 30, 25);
            if (--n <= 0) {
                this.finishLastCircle(ctx);
                return;
            }

            ctx.closePath();
            ctx.save();
            ctx.moveTo(370, 55);
            ctx.lineTo(450, 75);
            this.setCanvasStyle(ctx);
            circleImg(ctx, src[3], 450, 50, 25);
            if (--n <= 0) {
                this.finishLastCircle(ctx);
                return;
            }



        }

    };
    // ctx.closePath();
    // ctx.save();
    // ctx.moveTo(500, 75);
    // ctx.lineTo(545, 185);
    // this.setCanvasStyle(ctx);
    //
    // circleImg(ctx, src[4], 520, 160, 25);
    // if (--n <= 0) {
    //     this.finishLastCircle(ctx)
    // }
    // 完成最后一个圈
    finishLastCircle = (ctx) => {
        ctx.shadowBlur = 5;
        ctx.shadowColor="#a7a7a7";
        ctx.closePath();
        ctx.strokeStyle = "#3fa4ff";
        ctx.lineWidth = 4;
        ctx.stroke();
    };

    setCanvasStyle = (ctx) => {
        ctx.strokeStyle = "#3fa4ff";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 5 ;
        ctx.shadowColor="#c4c4c4";
        ctx.stroke();
        ctx.restore();
    };


    componentWillMount() {
        this.setState({
            info: this.props.imgList.slice(0)
        })
    }


    componentDidMount() {

        console.log(this.state.info);
            let len = this.state.info.length;
            let count = len;
            let imgList = [];

            for (let i = 0; i < len; i++) {
                let yImg = new Image();
                yImg.src = this.state.info[i].figureurl;
                imgList.push(yImg);
            }
            this.setState({
                imgList: imgList.slice(0)
            }, () => {
                for (let i = 0; i < len; i++) {
                    imgList[i].onload = () => {
                        count--;
                        this.drawStars(len, count);
                    }
                }
            })


    }

    render() {
        return (
            <div >
                <canvas
                    id={'myCanvas'}
                    className={style.canvas}
                     >
                    您的浏览器暂不支持Canvas!
                </canvas>
            </div>
        );
    }
}


export default Graph;
