/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {Link, Switch} from "react-router-dom";
import style from './center.scss';
import Route from "react-router-dom/es/Route";
import Park from "../park/park";
import Pace from "../pace/pace";
import My from "../my/My";
import ERROR from "../ERROR/ERROR";


class Center extends Component {
    render() {
        return (
            <div className={style.main}>
                <Route render={({location}) => (
                        <Switch key={location.pathname} location={location}>
                            <Route component={Park} path={'/center/park'}/>
                            <Route component={Pace} path={'/center/pace'}/>
                            <Route component={My}   path={'/center/my'}/>
                            <Route component={ERROR}/>
                        </Switch>)}>
                </Route>
            </div>
        );
    }
}

export default Center;
