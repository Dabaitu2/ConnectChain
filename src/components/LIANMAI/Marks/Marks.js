/**
 *    Created by tomokokawase
 *    On 2018/7/26
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './marks.scss'
import {findDOMNode} from 'react-dom';
import {connect} from "react-redux";
import {save_marks, save_tag} from "../../../redux/actions";
import {instance} from '../../../config/axiosConfig';

const TabList = [
    "态度好", "回应快", "热心肠", "条理清晰", "体谅人",
];

@connect(
    state => state.user,
    {save_marks, save_tag}
)
class Marks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mark: 3.5,
            TabList: TabList,
            onEdit: false,
            tips: "添加",
            newTab:"",
            imgWidth: 0,
            documentWidth: 0,
            tag: ""
        }
    }

    /**
     *
     * 处理新增标签
     * 由于版面不够，从state中剔除一个，然后入队一个新的
     * 长度不能大于6个字
     *
     * */
    handleNewTab = () => {
        if(this.state.newTab!=="") {
            let tabList = this.state.TabList.slice(0);
            tabList.unshift(this.state.newTab.substr(0, 6));
            tabList.pop();
            this.setState({
                TabList: tabList,
                newTab: "",
                active: 0
            },()=>{
                this.props.save_tag(tabList[0])
            })
            //Todo 发送ajax方法保存标签
        }
        this.setState({
            onEdit : false
        })
    };

    /**
     * 处理拖动和触摸事件
     * */
    handleJudge = (e) => {
        let {offsetLeft, offsetRight} = this.state;
        let newX = e.touches[0].clientX;
        if (newX < offsetLeft) {
            newX = offsetLeft;
        }
        if (newX > offsetRight) {
            newX = offsetRight;
        }
        let percentage = newX - this.state.offsetLeft;
        let num = Math.round(percentage / this.state.unit);
        this.setState({
            mark: num/2,
        },()=>{
            this.props.save_marks(num/2);
        })
    };


    /**
     *
     * 获取评分的左边距和右边距
     * 帮助触摸事件定位极值点
     *
     * */
    componentDidMount() {
        // TODO 这个方法很烂，想个获取子组件宽度的办法
          let imgWidth = 160; // 强行获取
          let documentWidth = window.document.documentElement.scrollWidth;
          this.setState({
              offsetLeft: (documentWidth - imgWidth) / 2,
              offsetRight: 1 / 2 * (imgWidth + documentWidth),
              unit: imgWidth / 10
          })
    }


    componentWillMount() {
        this.props.save_marks(3.5);
    }


    componentWillReceiveProps(nextProps) {
        if('ID' in nextProps) {
            instance.post('/dialogue/getSkillType', {ID: nextProps.ID}).then((res) => {
                console.log(res);
                if (res.data != null && res.data.ans != "fail") {
                    this.setState({
                        TabList: res.data.slice(0)
                    })
                }
            })
        }
    }


    render() {
        return (
            <div>
                <div className={style.lightTab}>
                    <h4>点亮他的标签</h4>
                    <ul>
                        <li
                            onTouchStart={()=>{
                                this.setState({
                                    onEdit: !this.state.onEdit
                                })
                            }}
                            className={`${style.add}`}>
                            +
                        </li>
                        {
                            this.state.TabList.map((v, index) => {
                                return <li
                                    key={v}
                                    className={this.state.active === index ? style.active : ""}
                                    onTouchStart={()=>{
                                        this.setState({
                                            active: index,
                                            tag: v
                                        },()=>{
                                            this.props.save_tag(v);
                                        })
                                    }}
                                >{v}</li>
                            })
                        }
                    </ul>
                    <input type="text"
                           placeholder={"您的评价..."}
                           value={this.state.newTab}
                           onChange={(e)=>{
                               this.setState({
                                   newTab: e.target.value
                               })
                           }}
                           style={{
                               width: this.state.onEdit ? "6rem" : "0rem",
                               transitionDuration: ".3s",
                               borderWidth:  this.state.onEdit ? "2px" : "0",
                           }}
                           className={style.addTab}/>
                    <span
                        className={style.confirm}
                        onTouchStart={()=>{
                            this.handleNewTab();
                        }}
                    >{this.state.onEdit?"添加":""}</span>
                </div>
                <h4 className={style.title}>信用评分</h4>
                <div
                    className={style.bg}
                    ref={'stars'}
                >
                    <img
                        src={require("../../../images/judge.png")}
                         className={style.judge}
                         onTouchMove={(e) => {
                            this.handleJudge(e);
                         }}
                         onTouchStart={(e)=>{
                             this.handleJudge(e);
                         }}
                         alt="judge"/>
                    <div
                        className={style.star}
                        style={{
                            width: `${this.state.mark * 2}em`
                        }}
                    />
                    <div
                        className={style.layer}
                    />
                </div>

            </div>
        );
    }
}


export default Marks;
