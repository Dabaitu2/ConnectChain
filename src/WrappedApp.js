/**
 *    Created by tomokokawase
 *    On 2018/7/22
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {store} from "./redux/stores";
import {Provider} from "react-redux";
import App from "./App";


class WrappedApp extends Component {
    render() {
        return (
            <Provider store={store}>
                <div>
                    <App/>
                </div>
            </Provider>
        );
    }
}


export default WrappedApp;
