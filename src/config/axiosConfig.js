/**
 *    Created by tomokokawase
 *    On 2018/7/21
 *    阿弥陀佛，没有bug!
 */
import axios from 'axios';
import ToastBox from '../components/LIANMAI/Toast/index';



const instance = axios.create({
    baseURL: 'http://uchuangbang.com/'
});

// let toast  = null;
// let confirm = null;

// // 统一拦截请求
// instance.interceptors.request.use(function (config) {
//     if(confirm!== null) {
//         confirm();
//     }
//     toast = ToastBox.alert({
//         content:"加载中"
//     });
//     return config;
// });
//
// // 统一拦截响应
// instance.interceptors.response.use(function (config) {
//     toast();
//     confirm = ToastBox.success({
//         content:"加载完毕"
//     });
//     return config;
// });

export {instance};