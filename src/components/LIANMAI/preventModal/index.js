/**
 *    Created by tomokokawase
 *    On 2018/8/8
 *    阿弥陀佛，没有bug!
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PrevantModal from './PrevantModal';


const show = (props) => {
    // 将这个函数的执行结果返回给一个变量使之成为一个函数，再次调用那个变量()就可以销毁这个组件
    // PrevantModal 应该存在于一个队列容器里
    // 首先将待插入模板的容器准备好，并插入dom节点
    let container = document.getElementById('PrevantModal_list');
    // 标志close方法有没有执行
    let flag = 0;
    if(container === null) {
        container = document.createElement('div');
        container.setAttribute('id', 'PrevantModal_list');
        document.body.appendChild(container);
    }

    // 指定节点的onclose方法
    const autoClose = () => {
        if(flag === 1) return;
        ReactDOM.unmountComponentAtNode(PrevantModalContainer);
        container.removeChild(PrevantModalContainer);
        if(typeof props.onClose === 'function') {
            props.onClose();
        }
        flag = 1;
    };

    let newToast = <PrevantModal {...props} close={autoClose}/>;
    let PrevantModalContainer = document.createElement('div');
    container.appendChild(PrevantModalContainer);

    ReactDOM.render(
        newToast,
        PrevantModalContainer
    );


    return ()=>autoClose();
};

class PrevantModalBox {
    static show = (props) => show({
        ...props,
    });
}

export default PrevantModalBox;