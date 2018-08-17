/**
 *    Created by tomokokawase
 *    On 2018/7/18
 *    阿弥陀佛，没有bug!
 */
import axios from 'axios'



export const AUTH_SUCCESS   = 'AUTH_SUCCESS';
export const ERROR_MSG      = 'ERROR_MSG';
export const LOGOUT         = 'LOGOUT';
export const LOAD_DATA      = 'LOAD_DATA';
export const INIT_WEB3      = 'INIT_WEB3';
export const CHANGE_PATH    = 'CHANGE_PATH';
export const INIT_PORT      = 'INIT_PORT';
export const MSG_READ       = 'MSG_READ';
export const MSG_RECV       = 'MSG_RECV';
export const MSG_LIST       = 'MSG_LIST';
export const SAVE_SCROLL    = 'SAVE_SCROLL';
export const INIT_CONTRACT_INSTANCE = 'INIT_CONTRACT_INSTANCE';
export const CONFIRM_ADDRESS_STATE  = 'CONFIRM_ADDRESS_STATE';
export const SAVE_USERNAME  = 'SAVE_USERNAME';

export const LOG_UNREAD     = 'LOG_UNREAD';
export const CLEAR_UNREAD   = 'CLEAR_UNREAD';


export const LOG_ADDRESS    = 'LOG_ADDRESS';

// 记录当前查看的问题状态，用来控制聊天窗口采纳通道的开关
export const LOG_STATUS     = "LOG_STATUS";
export const CLEAR_STATUS   = "CLEAR_STATUS";


// 评分相关
export const SAVE_MARKS     = 'SAVE_MARKS';
export const CLEAR_MARKS    = 'CLEAR_MARKS';
export const SAVE_TAG       = 'SAVE_TAG';
export const CLEAR_TAG      = 'CLEAR_TAG';

export const SET_QUESTION_QUERY   = 'SET_QUESTION_QUERY';
export const CLEAR_QUESTION_QUERY = 'CLEAR_QUESTION_QUERY';



// 记录用户id
export const LOG_ID = 'LOG_ID';
//  微信转发服务
export const REGIST_URL = 'REGIST_URL';



/**
 *
 *  actions creator
 *
 */

export function loadData(userinfo) {
    return {type: LOAD_DATA, payload:userinfo}
}
export function errorMsg(msg) {
    return { type:ERROR_MSG, msg:msg }
}
export function AuthSuccess(obj) {
    // 解构赋值+对象展开符取特定属性
    const { pwd, ...data} = obj;
    return {type: AUTH_SUCCESS, payload:data }
}
export function changePath(path) {
    return {type: CHANGE_PATH, path: path}
}
export function login({username, password, rememberMe}) {
    if(!username || !password) {
        return errorMsg("用户名密码必须输入");
    }
    return async dispatch => {
        const res = await axios.post('/users/userLogin', {username, password, rememberMe});
        if (res.status === 200 && res.data.code === 200){
            dispatch(AuthSuccess(res.data.data))
        } else {
            dispatch(errorMsg(res.data.msg));
        }
    }
}
// 用户记录评分，清除评分以及标签
export function save_marks(marks) {
    return {type: SAVE_MARKS, marks: marks};
}

// 用户接受到未读新消息
export function log_unread(unread) {
    return {type: LOG_UNREAD, unread: unread}
}
// 用户已读
export function clear_unread() {
    return {type: CLEAR_UNREAD}
}


export function clear_marks() {
    return {type: CLEAR_MARKS};
}

export function save_tag(tag) {
    return {type: SAVE_TAG, tag: tag};
}

export function clear_tag() {
    return {type: CLEAR_TAG};
}

export function log_status(status) {
    return {type: LOG_STATUS, status: status}
}

export function clear_status() {
    return {type: CLEAR_STATUS}
}

// 确定用户是否已经绑定了地址
export function confirm_address_state(flag) {
    return {type: CONFIRM_ADDRESS_STATE, address_state: flag > 0}
}

export function init_web3(web3) {
    return {type: INIT_WEB3, web3: web3}
}

export function init_contract_instance(instance) {
    return {type: INIT_CONTRACT_INSTANCE, instance: instance}
}

export function logoutSubmit() {
    return {type: LOGOUT}
}

export function saveUserName(userName) {
    return {type: SAVE_USERNAME, userName: userName}
}

// 初始化视口大小
export function initPort(width) {
    return {type: INIT_PORT, width : width}
}

// 保存页面滚动位置
export function saveScroll(scroll) {
    return {type: SAVE_SCROLL, scroll:scroll}
}

// 微信第三方服务
export function registUrl(url) {
    return {type: REGIST_URL, url: url}
}
// 记录ID
export function logID(ID) {
    return {type: LOG_ID, id: ID}
}

// 记录跳转到otherquestion的Query
export function setOtherQuery(query) {
    return {type: SET_QUESTION_QUERY, query: query}
}

// 删除跳转到otherquestion的Query
export function clearOtherQuery() {
    return {type: CLEAR_QUESTION_QUERY}
}

export function log_address(address) {
    return {type: LOG_ADDRESS, address: address}
}