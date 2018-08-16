/**
 *    Created by tomokokawase
 *    On 2018/7/27
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import { Chart, Axis, Coord, Line, Point, Area } from 'viser-react';
const DataSet = require('@antv/data-set');

const activityTags = ["打牌","抽烟",'喝酒',
    '带孩子','睡觉','挣钱',
    '败家','打怪兽','当怪兽',
    '修电脑','炒菜','煮菜', "炖菜","烧菜","蒸菜","凉拌菜","烤肉","吃饭","踢球"];


// const sourceData = [
//     { item: activityTags[0], mark: Math.round(Math.random() * 3 + 2) },
//     { item: activityTags[1], mark: Math.round(Math.random() * 3 + 2) },
//     { item: activityTags[2], mark: Math.round(Math.random() * 3 + 2) },
//     { item: activityTags[3], mark: Math.round(Math.random() * 3 + 2) },
//     { item: activityTags[4], mark: Math.round(Math.random() * 3 + 2) },
//     { item: activityTags[5], mark: Math.round(Math.random() * 3 + 2) },
// ];



// const dv = new DataSet.View().source(sourceData);
// dv.transform({
//     type: 'fold',
//     fields: ['mark'],
//     key: 'user',
//     value: 'score',
// });
// const data = dv.rows;
//
// const scale = [{
//     dataKey: 'score',
//     min: 0,
//     max: 5,
// }];


class MyComponent extends Component {


    render() {
        let sourceData = this.props.sourceData;
        const dv = new DataSet.View().source(sourceData);
        dv.transform({
            type: 'fold',
            fields: ['mark'],
            key: 'user',
            value: 'score',
        });
        const data = dv.rows;

        const scale = [{
            dataKey: 'score',
            min: 0,
            max: 5,
        }];
        const axis1Opts = {
            dataKey: 'item',
            line: null,
            tickLine: null,
            grid: {
                lineStyle: {
                    lineDash: null
                },
                hideFirstLine: false,
            },
        };

        const axis2Opts = {
            dataKey: 'score',
            line: null,
            tickLine: null,
            grid: {
                type: 'polygon',
                lineStyle: {
                    lineDash: null,
                },
            },
            label: null
        };

        const coordOpts = {
            type: "polar",
            radius: "0.9",

        };
        return (
            <Chart forceFit
                   height={200}
                   data={data}
                   padding={[25, 15, 35, 15]}
                   scale={scale}>
                <Axis {...axis1Opts} />
                <Axis {...axis2Opts} />
                <Coord {...coordOpts} />
                <Line position="item*score" color="#357CAA" size={2} style={{
                    lineWidth:1
                }}/>
                <Point position="item*score" color="#357CAA" size={4} shape="circle" />
                <Area position="item*score" color="#C0EBFB"/>
            </Chart>
        );
    }

}


export default MyComponent;
