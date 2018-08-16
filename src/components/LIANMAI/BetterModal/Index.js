/**
 *    Created by tomokokawase
 *    On 2018/8/8
 *    阿弥陀佛，没有bug!
 */
import React from 'react';
import ReactDOM from 'react-dom';
import BetterModal from './betterModal';
/**
 *  使用示例:
 *  onClick={(e)=>{
 *     e.preventDefault();
 *     Modal.defaults({
 *         title: 'Demo',
 *         content: 'Hello world!',
 *         okText: '确认',
 *         cancelText: '取消',
 *         key: '0',
 *         onOk: () => console.log('ok'),
 *         onCancel: () => console.log('cancel')})}}
 * */
const show = (props) => {
    // 将这个函数的执行结果返回给一个变量使之成为一个函数，再次调用那个变量()就可以销毁这个组件
    let component = null;
    // 首先将待插入模板的容器准备好，并插入dom节点
    let div = document.getElementById(props.key+"")
    if(div === null) {
        div = document.createElement('div');
        div.setAttribute('id', props.key+"");
        document.body.appendChild(div);
    }

    // 指定节点的onclose方法
    const onClose = () => {
        console.log("触发组件卸载!");
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
        console.log("组件卸载完毕!");
        if(typeof props.onClose === 'function') {
            props.onClose();
        }
    };
    // ReactDOM.render 是 React 的最基本方法，用于将模板转为 HTML 语言，并插入指定的 DOM 节点。
    // 此一个参数是模板, 第二个参数就是指定的位置
    // 组件第一次被调用的时候相当于进行懒加载，之后就一直存在了
    ReactDOM.render(
        <BetterModal
            {...props}
            onClose={onClose}
            // ref 回调函数指定 component的指向
            ref={c => component = c}
            isOpen
        >{props.content}</BetterModal>,
        div
    );
    // 返回引用，方便完全销毁
    return ()=> onClose();
};

class ModalBox {
    static confirm = (props) => show({
        ...props,
        type: 'confirm'
    });
    static alert = (props) => show({
        ...props,
        type: 'alert'
    });
    static error = (props) => show({
        ...props,
        type: 'error'
    });
    static success = (props) => show({
        ...props,
        type: 'success'
    });
    static defaults = (props) => show({
        ...props,
        type: 'defaults'
    })
};

export default ModalBox;