/**
 *    Created by tomokokawase
 *    On 2018/7/18
 *    阿弥陀佛，没有bug!
 */
import {createStore, applyMiddleware, compose } from 'redux'
import {reducers} from './reducers'
import thunk from 'redux-thunk'

const reduxDevtools = window.devToolsExtension ? window.devToolsExtension() : f=>f;
const store = createStore(reducers, compose(
    applyMiddleware(thunk),
    reduxDevtools
));


export {store};