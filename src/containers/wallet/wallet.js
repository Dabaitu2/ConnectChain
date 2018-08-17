/**
 *    Created by tomokokawase
 *    On 2018/7/28
 *    阿弥陀佛，没有bug!
 */
import React, {Component} from 'react';
import style from './wallet.scss'
import {withRouter} from "react-router-dom";
import PayModal from '../../components/LIANMAI/payModal/payModal';
import {instance} from '../../config/axiosConfig';
import {connect} from "react-redux";
import {generateKeyStore, generateOwnKeyStore, getLocalPrivateKey, getWrappedConstant} from "../../contractTools/tools";
import {CONTRACT_ADDRESS, PLATFORM_ADDRESS} from '../../config/web3Config';
import {buy, changeAddress, sell} from "../../components/LIANMAI/LIANMAI_tools";
import ToastBox from "../../components/LIANMAI/Toast/index";
import PrevantModalBox from "../../components/LIANMAI/preventModal/index";
import Modal from '../../components/LIANMAI/BetterModal/Index'
import {log_address} from "../../redux/actions";


const testInfo = {
    id: 2,
    token: 50,
    address: "" //0xc8b4eedc84f821a63db0b93377221c5de3ce685e
};

@withRouter
@connect(
    state => state.user,
    {log_address}
)
class Wallet extends Component {
    constructor(props) {
        super(props);
        this.flag = -1;
        this.state = {
            info: testInfo,
            confirm: false,
            show: false,
            modelleave: false,
            num: 0,
            privateKey: "",
            address: "",
            inputPK: "",
            token: 0,
            remainETH: "",
            newPK: "",
            newPWD: ""
        }
    }

    /**
     * 清空一切和密码相关的state数据
     * */
    resetSecret = () => {
        this.setState({
            address: "",
            pwd: "",
            inputPK: "",
            ConfirmPwd: ""
        });
    };
    /**
     * 处理state变化的通用函数
     * @param {String} key   state中的属性
     * @param {any}    value key对应的值
     * */
    handleChange = (key, value) => {
        this.setState({
            [key]: value
        })
    };

    /**
     * 向智能合约发起请求更新用户的地址
     * @param {number|string} id        用户的ID
     * @param {string}        address   用户的地址
     * */
    static async handleUpdateAddress(id, address) {
        let constantObj = getWrappedConstant(
            'bindAddress',
            [id, address],
            CONTRACT_ADDRESS,
            PLATFORM_ADDRESS);
        return await instance.post('/eth/tryCall', {constantObj: constantObj});
    };

    /**
     * 合约地址更新完成后再向平台数据库写入用户地址
     * @param {number|string} id        用户的ID
     * @param {string}        address   用户的地址
     * */
    static async sendAddressToPlatform(id, address) {
        return await instance.post('/my/updateAddress', {ID: id, address: address});
    }

    /**
     * 向本地请求读取私钥文件，并且设置到state中暂存
     * @param {object}          web3    web3通信库
     * @param {number|string}   id      用户的id
     * @param {string}          pwd     用户在创建keyStore时设定的密码
     * */
    async acquireAccount(web3, id, pwd) {
        let modal = PrevantModalBox.show();
        try {
            console.log("start to decrypt PK");
            let account = await getLocalPrivateKey(web3, pwd, id, this.state.address);
            console.log("decrypt FINISHed");
            this.setState({
                privateKey: account.privateKey,
                address: account.address
            }, () => {
                setTimeout(() => {
                    modal();
                }, 400);
                ToastBox.success({
                    content: "私钥授权成功!"
                });
                console.log("end!");
            });
        } catch (err) {
            setTimeout(() => {
                modal();
            }, 400);
            ToastBox.error({
                content: "您的密码不正确!"
            });
        }
    }

    /**
     * 用户创建私钥keyStore文件并存储在localStorage
     * @param {object}          web3        web3通信库
     * @param {number|string}   id          用户的id
     * @param {string}          pwd         用户在创建keyStore时设定的密码
     * @param {string}          ConfirmPwd  确认密码
     * */
    async generateAccount(web3, pwd, ConfirmPwd, id) {
        console.log("创建新账户!");
        if (!pwd || !ConfirmPwd || pwd !== ConfirmPwd) {
            // TODO 显示提示信息
            ToastBox.error({
                content: "信息填写有误!"
            })
        } else {
            let sta = await generateKeyStore(web3, pwd, id);
            if (sta && sta.status === "success") {
                ToastBox.success({
                    content: "账户创建成功!"
                });
                // 这里之所以不把两个更新步骤一起做是因为上传到区块链的动作使用了公共接口。
                let rst = await Wallet.handleUpdateAddress.bind(this)(id, sta.address);
                if (rst.data.ans === "success") {
                    let final = await Wallet.sendAddressToPlatform.bind(this)(id, sta.address);
                    if (final.data.ans === "success") {
                        ToastBox.success({
                            content: "地址更新成功!"
                        });
                        this.resetSecret();
                    } else {
                        ToastBox.error({
                            content: "地址更新失败!"
                        });
                    }
                }

            } else {
                ToastBox.error({
                    content: "账户创建失败!"
                });
            }
        }
    }

    /**
     * 用户导入已经存在的私钥创建一个本机keyStore文件，方便调用
     * 注意，本私钥应该和本账户相关，否则无法进行正常操作
     * @param {object}          web3        web3通信库
     * @param {string}          inputPK     用户输入的私钥
     * @param {string}          pwd         用户在创建keyStore时设定的密码
     * @param {string|number}   id          用户的ID
     * */
    async generateOldAccount(web3, inputPK, pwd, id) {
        if (!pwd) {
            // TODO 显示提示信息
        } else {
            let sta = await generateOwnKeyStore(web3, inputPK, pwd, id);
            if (sta && sta.status === "success") {
                // 这里之所以不把两个更新步骤一起做是因为上传到区块链的动作使用了公共接口。
                ToastBox.success({
                    content: "私钥导入成功!"
                });
                this.resetSecret();
            } else {
                ToastBox.error({
                    content: "私钥导入失败!"
                });
            }
        }
    }

    /**
     * 为已经存在地址的用户直接绑定已有账户到链脉账号上
     * 地址会根据公钥自动计算生成，所以不需要输入地址
     * @param {object}          web3        web3通信库
     * @param {string}          inputPK     用户输入的私钥
     * @param {string}          pwd         用户在创建keyStore时设定的密码
     * @param {string|number}   id          用户的ID
     * */
    async BindAddressToAccount(web3, inputPK, pwd, id) {
        if (!pwd) {
            // TODO 显示提示信息
        } else {
            let sta = await generateOwnKeyStore(web3, inputPK, pwd, id);
            if (sta && sta.status === "success") {
                // 这里之所以不把两个更新步骤一起做是因为上传到区块链的动作使用了公共接口。
                ToastBox.success({
                    content: "创建私钥文件成功!"
                });
                let rst = await Wallet.handleUpdateAddress.bind(this)(id, sta.address);
                if (rst.data.ans === "success") {
                    let final = await Wallet.sendAddressToPlatform.bind(this)(id, sta.address);
                    if (final.data.ans === "success") {
                        ToastBox.success({
                            content: "地址更新成功!"
                        });
                        this.resetSecret();
                    } else {
                        ToastBox.error({
                            content: "地址更新失败!"
                        });
                    }
                }
            } else {
                ToastBox.error({
                    content: "创建私钥文件失败!"
                });
            }
        }
    }

    /**
     * 用户修改绑定的地址
     * */
    async handleChangeAddress() {
        let {id, web3} = this.props;
        let {newPK, newPWD, address} = this.state;
        if (!newPWD || !newPK) {
            ToastBox.error({
                content: "信息存在缺失!"
            });
            return;
        }
        const newAccount = await web3.eth.accounts.privateKeyToAccount(newPK);
        const newAddress = newAccount.address;
        let serializedTx = await changeAddress(id, newAddress, this.props.instance, newPK, address, web3);
        try {
            let res = await instance.post('/eth/tryTrade', {serializedTx: serializedTx});
            if (res.data.ans === "success") {
                let newToken = await instance.post('/my/updateToken', {ID: id});
                let ans = await generateOwnKeyStore(web3, newPK, newPWD, newAddress);
                if (!ans) {
                    ToastBox.error({
                        content: "更换地址绑定失败!"
                    });
                    return;
                }
                this.setState({
                    token: newToken.data.data,
                    address: newAddress
                }, () => {
                    ToastBox.success({
                        content: "更换地址绑定成功!"
                    });
                    this.getEthInfo.bind(this)();
                });
            }
        } catch (err) {
            ToastBox.error({
                content: "更换地址绑定失败!"
            });
        }

    }

    /**
     * 根据不同的flag值来确定不同的回调函数
     * @link {function} acquireAccount
     * */
    async handleConfirm() {
        // 没有网络或登陆状态错误
        let {id, web3} = this.props;
        console.log(id);
        let {flag, pwd, ConfirmPwd, inputPK} = this.state;
        if (id === 0) return;
        switch (flag) {
            case 1:
                this.acquireAccount.bind(this)(web3, id, pwd);
                return;
            case 2:
                this.generateOldAccount.bind(this)(web3, inputPK, pwd, id);
                return;
            case -1:
                this.BindAddressToAccount.bind(this)(web3, inputPK, pwd, id);
                return;
            default:
                this.generateAccount.bind(this)(web3, pwd, ConfirmPwd, id);
                return;
        }
    };

    handleLeave() {
        this.setState({
            modelleave: !this.state.modelleave
        })
    }

    handleTouchChange = () => {
        this.setState({
            show: !this.state.show
        })
    };

    async handleDraw(num) {
        let modal = PrevantModalBox.show();
        if (this.state.token - num < 10) {
            ToastBox.error({
                content: "账户余额暂时不能提尽!"
            });
            modal();
            return;
        }
        try {
            let {id, web3} = this.props;
            let {privateKey, address} = this.state;
            let serializedTx = await sell(parseInt(id, 10), num, this.props.instance, privateKey, address, web3);
            instance.post('/eth/tryTrade', {serializedTx: serializedTx}).then((res) => {
                if (res.data.ans === "success") {
                    instance.post('/my/updateToken', {ID: this.props.id}).then(rst => {
                        this.setState({
                            token: rst.data.data
                        }, () => {
                            ToastBox.success({
                                content: "代币提现成功!"
                            });
                            this.getEthInfo.bind(this)();
                            modal();
                        });
                    });
                } else {
                    ToastBox.error({
                        content: "提现失败!"
                    });
                    modal();
                }
            })
        } catch (err) {
            ToastBox.error({
                content: "请先授权解锁私钥!"
            });
            modal();
        }
    };

    async handleCharge(num) {
        let modal = PrevantModalBox.show();
        try {
            let {id, web3} = this.props;
            let {privateKey, address} = this.state;
            let serializedTx = await buy(parseInt(id, 10), num, this.props.instance, privateKey, address, web3);
            instance.post('/eth/tryTrade', {serializedTx: serializedTx}).then((res) => {
                if (res.data.ans === "success") {
                    instance.post('/my/updateToken', {ID: this.props.id}).then(rst => {
                        this.setState({
                            token: rst.data.data
                        }, () => {
                            ToastBox.success({
                                content: "购买代币成功!"
                            });
                            this.getEthInfo.bind(this)();
                            modal();
                        }).catch(err => {
                            ToastBox.error({
                                content: "购买代币失败"
                            });
                        });
                    });

                } else {
                    ToastBox.error({
                        content: "购买代币失败，请检查您的以太坊账户余额!"
                    });
                    modal();
                }
            })
        } catch (err) {
            ToastBox.error({
                content: "请先授权解锁私钥!"
            });
            modal();
        }
    }

    async getEthInfo() {
        try {
            const ans = await instance.post('/eth/getBalance', {address: this.state.info.address});
            this.setState({
                remainETH: (ans.data / (10 ** 18)).toString()
            })
        } catch (err) {
            ToastBox.error({
                content: "获取余额失败!"
            });
        }
    };

    haveKeysPanel = () => {
        return (
            <div>
                <h3 style={{margin: "0.5rem auto"}}>确定查看私钥?</h3>
                <div className={style.hint}>请输入您设置的支付密码</div>
                <div className={style.hint}>该步骤可以在断网条件下进行!</div>
                <input
                    type="password" id={"password"} placeholder={"请输入您的密码"}
                    onChange={(e) => {
                        this.handleChange("pwd", e.target.value);
                    }}
                    className={style.passwordInput}/>
                <div>
                    <p
                        className={style.opt}
                        onClick={() => {
                            this.handleChange('flag', 2)
                        }}
                    ><span className={style.bindNav}>为本机创建keyStore</span></p>
                </div>
            </div>
        )
    };

    noKeysPanel = () => {
        let {info} = this.state;
        let {history} = this.props;
        return (
            <div>
                <h3 style={{margin: "0.5rem auto"}}>您还没有绑定地址!</h3>
                <div className={style.warn}>
                    请设定您的支付密码
                    <span onTouchStart={() => {
                        history.push(`/explain/${info.id}`)
                    }}
                          className={style.ask}
                    ><img src={require('../../images/question.png')} alt="why"/></span>
                </div>
                <input
                    type="password" id={"password"} placeholder={"请输入您的密码"}
                    onChange={(e) => {
                        this.handleChange("pwd", e.target.value);
                    }}
                    className={style.passwordInputLight}/>
                <input
                    type="password" id={"password"} placeholder={"请确认您的密码"}
                    onChange={(e) => {
                        this.handleChange("ConfirmPwd", e.target.value);
                    }}
                    className={style.passwordInputLight}/>
                <div>
                    <p
                        className={style.opt}
                        onClick={() => {
                            this.handleChange('flag', -1);
                        }}
                    ><span className={style.bindNav}>绑定已有地址</span></p>
                </div>
            </div>
        );
    };

    induceKeyPanel = () => {
        return (
            <div>
                <h3 style={{margin: "0.5rem auto"}}>为已有私钥创建Keystore</h3>
                <div className={style.warn}>
                    可以在无网络条件下进行
                </div>
                <textarea
                    placeholder={"请输入您的私钥"}
                    onChange={(e) => {
                        this.handleChange("inputPK", e.target.value);
                    }}
                    className={style.textAreaInputLight}/>
                <input
                    type="password" id={"password"} placeholder={"请输入您的密码"}
                    onChange={(e) => {
                        this.handleChange("pwd", e.target.value);
                    }}
                    className={style.passwordInputLight}/>
                <div>
                    <p className={style.opt}
                       onClick={() => {
                           this.handleChange('flag', 1)
                       }}
                    ><span className={style.bindNav}>返回</span></p>
                </div>
            </div>
        )
    };

    bindOldKeyPanel = () => {
        return (
            <div>
                <h3 style={{margin: "0.5rem auto"}}>为已有账户绑定地址</h3>
                <div className={style.warn}>
                    可以在无网络条件下进行
                </div>
                <textarea
                    placeholder={"请输入您的私钥"}
                    onChange={(e) => {
                        this.handleChange("inputPK", e.target.value);
                    }}
                    className={style.textAreaInputLight}/>
                <input
                    type="password" id={"password"} placeholder={"请输入您的密码"}
                    onChange={(e) => {
                        this.handleChange("pwd", e.target.value);
                    }}
                    className={style.passwordInputLight}/>
                <div>
                    <p className={style.opt}
                       onClick={() => {
                           this.handleChange('flag', 0)
                       }}
                    ><span className={style.bindNav}>返回</span></p>
                </div>
            </div>
        )
    };

    decidedShowWhichPanel = (flag) => {
        switch (flag) {
            case 1:
                return this.haveKeysPanel();
            case 2:
                return this.induceKeyPanel();
            case -1:
                return this.bindOldKeyPanel();
            default:
                return this.noKeysPanel();
        }
    };


    getWalletInfo = (ID) => {
        instance.post('/my/getWalletInfo', {ID: ID}).then((res) => {
            if (res.data.ans && res.data.ans === 'error') {
                ToastBox.error({
                    content: "获取钱包信息错误!"
                })
            } else {
                this.setState({
                    info: res.data,
                    token: res.data.token,
                    address: res.data.address
                }, () => {
                    this.props.log_address(res.data.address);
                    this.setState({
                        flag: this.state.info.address && this.state.info.address !== "" ? 1 : 0
                    });
                    this.getEthInfo.bind(this)();
                })
            }
        })
    };

    /**
     * 用来绑定新地址的输入框组
     * */
    BindGroup = () => {
        return (
            <div className={style.bindGroup}>
                <textarea
                    placeholder={'请输入您的新私钥'}
                    onChange={(e) => this.handleChange('newPK', e.target.value)}
                    className={style.textAreaInputLight}/>
                <input type="password"
                       placeholder={'请输入新的支付密码'}
                       onChange={(e) => this.handleChange('newPWD', e.target.value)}
                       className={style.passwordInputLight}/>
            </div>
        )
    };
    /**
     * 用来接收用户体现或者充值数目的输入框
     * */
    NumGroup = () => {
        return (
            <div className={style.numGroup}>
                <input type="number"
                       placeholder={'请输入充值或提现的金额'}
                       onChange={(e) => this.handleNum(e.target.value)}
                       className={style.passwordInputLight}/>
            </div>
        )
    };

    handleNum = (num) => {
        if (num > this.state.token) num = this.state.token;
        if (num < 1) num = 1;
        this.handleChange('num', num);
    };

    componentWillMount() {
        // flag 为0 用户已有地址， 为1，用户需绑定
        this.getWalletInfo(this.props.id);
    }


    render() {
        let {show, modelleave, flag, info, token} = this.state;
        let {history} = this.props;
        return (
            <div className={style.main}>
                <PayModal
                    icon={'unlock'}
                    handleShow={this.handleTouchChange.bind(this)}
                    handleConfirm={this.handleConfirm.bind(this)}
                    handleLeave={this.handleLeave.bind(this)}
                    show={show}
                    leave={modelleave}
                    ref={'modal'}
                >
                    {this.decidedShowWhichPanel(flag)}
                </PayModal>
                <div className={style.nav}>
                    <div className={style.back} onTouchStart={history.goBack}>
                        <img src={require('../../images/leftBack.jpg')} alt="back"/>
                        <span>我的钱包</span>
                    </div>
                    <div className={style.seeKey}>
                        <img src={require('../../images/key.png')} alt="key"/>
                        <span onTouchStart={this.handleTouchChange}>私钥授权</span>
                    </div>
                </div>
                <div className={style.content}>
                    <div className={style.wallet}>
                        <div className={style.top}>
                            <span/>
                        </div>
                        <div className={style.center}>
                            <span className={style.tipsInfo}>M币</span>
                            <span className={style.money}>{token}</span>
                        </div>

                    </div>
                    <div className={style.btnGroup}>
                        <div className={style.charge} onClick={() => {
                            Modal.defaults({
                                title: '用户充值',
                                content: this.NumGroup(),
                                okText: '确认',
                                cancelText: '取消',
                                key: 'confirm',
                                onOk: () => {
                                    this.handleCharge.bind(this)(this.state.num);
                                },
                                onCancel: () => {
                                    ToastBox.warning({
                                        content: "用户取消充值!"
                                    });
                                }
                            })
                        }
                        }>
                            <img src={require('../../images/charge.jpg')} alt="draw"/>
                            <span>充值</span>
                        </div>
                        <div onClick={()=>{Modal.defaults({
                            title: '用户提现',
                            content: this.NumGroup(),
                            okText: '确认',
                            cancelText: '取消',
                            key: 'confirm',
                            onOk: () => {
                                this.handleDraw.bind(this)(this.state.num);
                            },
                            onCancel: () => {
                                ToastBox.warning({
                                    content: "用户取消提现!"
                                });
                            }
                        })}}>
                            <img src={require('../../images/draw.jpg')} alt="charge"/>
                            <span className={style.draw}>提现</span>
                        </div>
                    </div>
                    <div className={style.ETHRemain}>
                        <img src={require('../../images/ETH.png')} alt="ETH"/>
                        {this.state.remainETH.length > 0 ? this.state.remainETH : "没有获取到ETH余额"}
                    </div>
                    <div className={style.tempPK}>
                        <img src={require('../../images/PK.png')} alt="PK"/>
                        {this.state.privateKey.length > 0 ? this.state.privateKey : "私钥解锁后可见"}
                    </div>

                    <h3 className={style.addressTip}>以太坊地址<span onClick={() => {
                        if (this.state.privateKey.length <= 0) {
                            ToastBox.warning({
                                content: "请先授权解锁私钥!"
                            });
                            return;
                        }
                        Modal.defaults({
                            title: '绑定地址',
                            content: this.BindGroup(),
                            okText: '确认',
                            cancelText: '取消',
                            key: 'confirm',
                            onOk: () => {
                                this.handleChangeAddress.bind(this)();
                            },
                            onCancel: () => {
                                ToastBox.warning({
                                    content: "取消地址绑定!"
                                });
                            }
                        });
                    }}>更换绑定地址</span></h3>
                    <div className={style.address}>
                        {flag >= 1 ? info.address : "您还没有地址，点击右上角去绑定或创建新账号"}
                    </div>

                </div>

            </div>
        );
    }
}


export default Wallet;
