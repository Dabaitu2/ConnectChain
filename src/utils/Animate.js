/**
 *    Created by tomokokawase
 *    On 2018/8/11
 *    阿弥陀佛，没有bug!
 */

/**
 *
 *  对Js设定的scrollTop使用的动画
 *  需要的参数:  scroll  设定的新scrollTop
 *             Element  施加动画的DOM节点
 *             time     scroll动画的时间
 *             direction        scroll的方向
 *             lastScrollTop    上一次滚动的位置
 * */
export const scrollLeft = (scroll, Element, time, direction, lastScrollTop) => {
    let count = 0;
    let interval = time/8;
    let absInterval = Math.abs(lastScrollTop - scroll)/interval;
    let interval_scroll = direction ? absInterval : -absInterval;

    let timer = setInterval(()=>{
        count+=8;
        Element.scrollLeft += interval_scroll;
        if(count>=time){
            Element.scrollLeft = Math.floor(scroll);
            clearInterval(timer);
        }
    },8)
};