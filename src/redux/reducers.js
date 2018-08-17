/**
 *    Created by tomokokawase
 *    On 2018/7/18
 *    阿弥陀佛，没有bug!
 */
import {
    AUTH_SUCCESS, CHANGE_PATH, ERROR_MSG, INIT_CONTRACT_INSTANCE, INIT_WEB3, LOAD_DATA, LOGOUT,
    MSG_READ, MSG_RECV, MSG_LIST, SAVE_SCROLL, REGIST_URL, LOG_ID, CONFIRM_ADDRESS_STATE, SAVE_MARKS, CLEAR_MARKS,
    SAVE_TAG, CLEAR_TAG, LOG_STATUS, CLEAR_STATUS, SAVE_USERNAME, LOG_UNREAD, CLEAR_UNREAD, SET_QUESTION_QUERY,
    CLEAR_QUESTION_QUERY, LOG_ADDRESS
} from './actions'

import {combineReducers} from "redux";
// import ipfsAPI from 'ipfs-api'
import {
    ETHEREUM_NODE_URL,
    IPFS_GATEWAY_URL,
    IPFS_API_PORT,
    IPFS_API_HOST, WEB3_PORT
} from "../config/web3Config";


export const ethereumNodeUrl = ETHEREUM_NODE_URL ? ETHEREUM_NODE_URL : `http://localhost:${WEB3_PORT}`;
export const ipfsApiAddress = {
    protocol: 'http',
    host: IPFS_API_HOST ? IPFS_API_HOST : 'localhost',
    port: IPFS_API_PORT ? IPFS_API_PORT : 5001
};
export const ipfsGatewayUrl = IPFS_GATEWAY_URL ? IPFS_GATEWAY_URL : 'http://localhost:5000';
// export const ipfs = ipfsAPI(ipfsApiAddress);

/**
 *
 *  reducers 监听actions并做出相应反应
 *
 *
 * */




//for user
const userInitState = {
    redirectTo: '',
    id: 0,
    isAuth: false,
    msg: '',
    user:'',
    type: "",
    path: "publish",
    ethereumNodeUrl: ethereumNodeUrl,
    ipfsGatewayUrl: ipfsGatewayUrl,
    ipfsApiAddress: ipfsApiAddress,
    web3: null,
    instance: null,
    url:"",
    address_state: false,
    marks: 0,
    tag: "",
    status: 0,
    userName: "",
    unread:[],
    query: null,
    address: ''
};

export function user(state=userInitState, action) {
    switch (action.type) {
        case AUTH_SUCCESS:
            return {...state, msg:'',redirectTo:'/park', isAuth: true, ...action.payload};
        case LOGOUT:
            return {...userInitState, redirectTo:"/login"};
        case ERROR_MSG:
            return {...state, isAuth: false, msg:action.msg};
        case LOAD_DATA:
            return {...state, ...action.payload};
        case INIT_WEB3:
            return {...state, web3: action.web3};
        case INIT_CONTRACT_INSTANCE:
            return {...state, instance: action.instance};
        case CHANGE_PATH:
            return {...state, path: action.path};
        case REGIST_URL:
            return {...state, url: action.url};
        case LOG_ID:
            return {...state, id: action.id};
        case CONFIRM_ADDRESS_STATE:
            return {...state, address_state: action.address_state};
        case SAVE_MARKS:
            return {...state, marks: action.marks};
        case CLEAR_MARKS:
            return {...state, marks: 0};
        case SAVE_TAG:
            return {...state, tag: action.tag};
        case CLEAR_TAG:
            return {...state, tag: ""};
        case LOG_STATUS:
            return {...state, status: action.status};
        case CLEAR_STATUS:
            return {...state, status: 0};
        case SAVE_USERNAME:
            return {...state, userName: action.userName};
        case LOG_UNREAD:
            return {...state, unread: [...state.unread, action.unread]};
        case CLEAR_UNREAD:
            return  {...state, unread: []};
        case SET_QUESTION_QUERY:
            return {...state, query: action.query};
        case CLEAR_QUESTION_QUERY:
            return {...state, query: null};
        case LOG_ADDRESS:
            return {...state, address: action.address};
        default :
            return state;
    }
}

// for chat
const ChatInitState = {
    chatmsg:[],
    users:{},
    unread: 0
};
export function chat(state=ChatInitState, action) {
    switch (action.type) {
        case MSG_LIST:
            return {...state, users:action.payload.users, chatmsg:action.payload.msgs, unread:action.payload.msgs.filter(v=>!v.read&&v.to===action.payload.userid).length};
        case MSG_RECV:
            const n = action.payload.to === action.userid ? 1:0;
            return {...state, chatmsg:[...state.chatmsg,action.payload], unread:state.unread+n};
        case MSG_READ:
            const {from, num} = action.payload;
            return {...state,
                chatmsg:state.chatmsg.map(v=>({...v, read:from===v.from?true:v.read})),
                unread: state.unread-num};
        default:
            return state;
    }
}

// 文档位置相关的state
// TODO 应该设置成一个数组，将每个对话的scroll开一个新的数组元素，这样才能保证每个地方有不同的state
const docInitState = {
    scroll:0
};
export function doc(state=docInitState, action) {
    switch (action.type) {
        case SAVE_SCROLL:
            return {...state, scroll: action.scroll};
        default:
            return state;
    }
}

// combine
export const reducers = combineReducers({
    user,
    chat,
    doc,
});
