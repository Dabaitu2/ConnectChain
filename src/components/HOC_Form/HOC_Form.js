/**
 *    Created by tomokokawase
 *    On 2018/7/19
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import {connect} from "react-redux";


@connect(
    state=>state.user
)
export default function HOC_Form(Comp) {
    return class Wrappercomp extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val
        })
    };

    render() {
        return (
            <Comp handleChange={this.handleChange} {...this.props} state={this.state}/>
        );
    }

}
}


