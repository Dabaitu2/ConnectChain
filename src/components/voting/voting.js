import React, {Component} from 'react';
import {VotingContract} from '../../utils/Contracts'

class Voting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            candidates: ["Amy","Bob","Sam"],
            tickets: [0, 0, 0],
            web3: this.props.web3,
            votingInstance: null,
            tokens: null,
            account: "",
        }
    }


    instantiateContract = () => {
        const contract = require('truffle-contract');
        const Voting = contract(VotingContract);
        Voting.setNetwork(5777);
        Voting.setProvider(this.state.web3.currentProvider);
        Voting.currentProvider.sendAsync = function () {
            return Voting.currentProvider.send.apply(Voting.currentProvider, arguments);
        };
        this.state.web3.eth.getAccounts((error, accounts) => {
            Voting.deployed().then((instance) => {
                console.log(instance);
                this.setState({
                    votingInstance: instance,
                    account: accounts[0],
                    // rest: this.state.web3.eth.account[0]
                }, () => {
                    this.getAllTickets();
                    this.getOwnTokens(accounts[0]);
                })
            });
        })
    }



    getOwnTokens = (address) => {
        this.state.votingInstance.voterDetails(address)
            .then((v) => {
                console.log(v);
                this.setState({
                    tokens: v[0]["c"]
                });
            });
    };


    componentWillMount() {
            this.instantiateContract();
    }


    async getTickets(value) {
        return await new Promise((resolve) => {
            this.state.votingInstance.totalVotesFor.call(value)
                .then((v)=>{
                    resolve(v["c"][0]);
                });
        });
    };

    getAllTickets = () => {
        let newTickets = [0, 0, 0];
        let taskList = this.state.candidates.map((value, index) => {
            return this.getTickets.bind(this)(value);
        });
        Promise.all(taskList).then(res => {
            newTickets = res;
            console.log(res);
            this.setState({
                tickets: newTickets
            });
        });
    };

    support = (value, num) => {
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.votingInstance.voteForCandidate(value, num, {from: accounts[0], gas:1000000})
                .then((v)=> {
                this.getAllTickets();
            });
        });
    };

    buyTokens = (value) => {
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.votingInstance
                .buy({
                        value: this.state.web3.utils.toWei(value*0.01+"", 'ether'),
                        from: accounts[0]
                    })
                .then((v)=> {
                    this.getOwnTokens(this.state.account);
                });
        });

    };


    render() {
        return this.state.web3 ? (
            <div>
                <h2>您的通证数量{this.state.tokens}</h2>
                <h2>您的地址 {this.state.account}</h2>
                <table>
                    <tbody>
                    {
                        this.state.candidates.map((value, index) => {
                            return (
                                <tr>
                                    <td>{value}</td>
                                    <td>点击投票</td>
                                    <td><input type={"submit"} onClick={(e) => {
                                        e.preventDefault();
                                        this.support(value, 5);
                                    }
                                    }/></td>
                                    <td>当前票数: {this.state.tickets[index]}</td>
                                </tr>)
                        })
                    }
                    </tbody>
                </table>
                <input type="submit" onClick={
                    (e) => {
                        e.preventDefault();
                        this.buyTokens(100);
                    }
                } value={"购买100token"} />
            </div>
        ) : <div />;
    }
}

Voting.propTypes = {};

export default Voting;
