/**
 *    Created by tomokokawase
 *    On 2018/7/19
 *    阿弥陀佛，没有bug!
 */

import React, {Component} from 'react';
import HOC_Form from "../HOC_Form/HOC_Form";
import {connect} from "react-redux";
// import {ipfs} from '../../redux/reducers'
import {EcommerceStoreContract} from "../../utils/Contracts";


@HOC_Form
@connect(
    state => state.user
)
class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.reader = null;
    }

    saveImageOnIpfs(reader) {
        const buffer = Buffer.from(reader.result);
        console.log(buffer);
        // return ipfs.add(buffer)
        //     .then(rsp => rsp[0].hash)
        //     .catch(err => console.error(err))
    }

    saveTextBlobOnIpfs(blob) {
        const descBuffer = Buffer.from(blob, 'utf-8');
        // return ipfs.add(descBuffer)
        //     .then( rsp => rsp[0].hash )
        //     .catch( err => console.error(err))
    }

    saveProductToBlockchain(imageId, descId) {
        let state = this.props.state;
        let auctionStartTime = state.startTime;
        let auctionEndTime = state.endTime;
        const contract = require('truffle-contract');
        const EcommerceStore = contract(EcommerceStoreContract);
        EcommerceStore.setNetwork(5777);
        EcommerceStore.setProvider(this.props.web3.currentProvider);
        return EcommerceStore.deployed()
            .then( inst => inst.addProductToStore(state.name,
                state.category,
                imageId, descId, parseInt(auctionStartTime, 10), parseInt(auctionEndTime, 10),
                this.props.web3.utils.toWei(state.startPrice.toString(), 'ether'),
                parseInt(state.condition, 10).toString(),
                {from: this.props.web3.eth.accounts[0], gas: 440000}))
            .then(() =>{
                alert("Your product was successfully added to your store!");
            })
            .catch(err => console.log(err))
    }

    addProductInStore = () => {
        let imageId, descId;
        return this.saveImageOnIpfs(this.reader)
            .then(id => imageId = id)
            .then(() => this.saveTextBlobOnIpfs(this.props.state.desc))
            .then(id => descId = id)
            .then(() => this.saveProductToBlockchain(imageId, descId))
            .catch(err => console.log(err))
    };

    render() {
        return (
            <div>
                <h2>商品上传</h2>
                <form action="#" onSubmit={(e)=>{e.preventDefault()}}>
                    <div className="shops-form-item">
                        <label htmlFor="name">商品名称</label>
                        <input type="text" name={"name"} id={"name"}
                               value={this.props.state.name}
                               onChange={(e)=>{
                                   this.props.handleChange("name", e.target.value)
                               }} />
                        <span>{this.props.state.name ? this.props.state.name:""}</span>
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="desc">商品描述</label>
                        <input type="text" name={"desc"} id={"desc"}
                               value={this.props.state.desc}
                               onChange={(e)=>{
                                   this.props.handleChange("desc", e.target.value)
                               }} />
                        <span>{this.props.state.desc?this.props.state.desc:""}</span>

                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="image">商品图片</label>
                        <input type="file" name={"image"} id={"image"} onChange={(e)=>{
                            if(e.target.files.length === 0) return;
                            let file = e.target.files[0];
                            this.reader = new window.FileReader();
                            this.reader.readAsArrayBuffer(file);
                        }}/>
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="category">商品类型</label>
                        <select name="category" id="category" onChange={(e)=>{
                            this.props.handleChange("category", e.target.value);

                        }}>
                            <option>Art</option>
                            <option>Books</option>
                            <option>Cameras</option>
                            <option>Cell Phones & Accessories</option>
                            <option>Clothing</option>
                            <option>Coins & Paper Money</option>
                            <option>Collectibles</option>
                            <option>Computers/Tablets & Networking</option>
                            <option>Consumer Electronics</option>
                            <option>Crafts</option>
                            <option>DVDs & Movies</option>
                            <option>Entertainment Memorabilia</option>
                            <option>Gift Cards & Coupons</option>
                            <option>Music</option>
                            <option>Musical Instruments & Gear</option>
                            <option>Pet Supplies</option>
                            <option>Pottery & Glass</option>
                            <option>Sporting Goods</option>
                            <option>Stamps</option>
                            <option>Tickets</option>
                            <option>Toys & Hobbies</option>
                            <option>Video Games</option>
                        </select>
                        {/*<span>{this.state.category}</span>*/}
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="startPrice">起始价格</label>
                        <input type="number"
                               name={"startPrice"}
                               id={"startPrice"}
                               value={this.props.state.startPrice}
                               onChange={(e)=>{
                                   this.props.handleChange("startPrice", e.target.value)
                               }} min={0} required={"required"}/>
                        <span>{this.props.state.startPrice ? this.props.state.startPrice:""}</span>
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="condition">产品状态</label>
                        <select name="condition" id="condition" onChange={(e)=>{
                            this.props.handleChange("condition", e.target.value)
                        }}>
                            <option value="0">新品</option>
                            <option value="1">二手</option>
                        </select>
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="startTime">起始时间</label>
                        <input type="text"
                               name={"startTime"}
                               onChange={(e)=>{
                                   let reg = /^[0-9]{4}\/(((0[13578]|(10|12))\/(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)\/(0[1-9]|[1-2][0-9]|30)))\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/
                                   if(!reg.test(e.target.value)) return;
                                   let time = new Date(Date.parse(e.target.value)).getTime() / 1000;
                                   this.props.handleChange("startTime", time)
                               }}
                               id={"startTime"} />
                    </div>
                    <div className="shops-form-item">
                        <label htmlFor="durTime">竞拍时间</label>
                        <select name="durTime" id="durTime" onChange={(e)=>{
                            let endTime = this.props.state.startTime + e.target.value * 60;
                            this.props.handleChange("endTime", endTime);
                        }}>
                            <option value="1">1分钟</option>
                            <option value="3">3分钟</option>
                            <option value="5">5分钟</option>
                            <option value="7">7分钟</option>
                            <option value="9">9分钟</option>
                        </select>
                    </div>
                    <input type="submit" onClick={(e)=>{
                        e.preventDefault();
                        this.addProductInStore();
                    }}/>
                    <input type="submit"
                           value={"尝试发送交易"}
                           onClick={(e)=>{
                        e.preventDefault();
                    }}/>
                </form>
            </div>
        );
    }
}


export default AddProduct;
