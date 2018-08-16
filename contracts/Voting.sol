pragma solidity ^0.4.18;

contract Voting {

  // 在Solidity中constant、view、pure三个函数修饰词的作用是告诉编译器，
  // 函数不改变/不读取状态变量，这样函数执行就可以不消耗gas了，因为不需要矿工来验证。
  // 在Solidity v4.17之前，只有constant，后续版本将constant拆成了view和pure。
  // view的作用和constant一模一样，可以读取状态变量但是不能改；pure则更为严格，
  // pure修饰的函数不能改也不能读状态变量，只能操作函数内部变量，否则编译通不过。


  struct voter {
    address voterAddress;          // 投票人账户地址
    uint  tokensBought;            // 投票人持有的股票通证总量
    uint[] tokensUsedPerCandidate; // 为每个候选人消耗的股票通证
  }

  // 以下均为状态变量
  mapping (bytes32 => uint) public votesReceived; // {候选人: 得票数}
  mapping (address => voter) public voterInfo;     // {投票者地址: 投票者完整信息}
  bytes32[] public candidateList;
  uint public totalTokens; 
  uint public balanceTokens; //剩余可以交易的token数量
  uint public tokenPrice;

  // 股票通证发行总量和股票单价
  constructor(uint tokens, uint pricePerToken, bytes32[] candidateNames) public {
    candidateList = candidateNames;
    totalTokens = tokens;
    balanceTokens = tokens;
    tokenPrice = pricePerToken;
  }

  function totalVotesFor(bytes32 candidate) view public returns (uint) {
    require(validCandidate(candidate));
    return votesReceived[candidate];
  }

  // 投票的通证数量
  function voteForCandidate(bytes32 candidate, uint votesInTokens) public {
    uint index = indexOfCandidate(candidate);
    require(index != uint(-1));
    // 第一次投票需要初始化voterInfo
    if(voterInfo[msg.sender].tokensUsedPerCandidate.length == 0) {
       for(uint i = 0; i < candidateList.length; i++) {
        voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
        }
    }
    uint availableTokens = voterInfo[msg.sender].tokensBought - 
                         totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
    require(availableTokens >= votesInTokens);
    require(validCandidate(candidate));
    votesReceived[candidate] += votesInTokens;
    voterInfo[msg.sender].tokensUsedPerCandidate[index] += votesInTokens;
  }

  function getCandidateList() public returns (bytes32[]){
    return candidateList;
  }

  function validCandidate(bytes32 candidate) view public returns (bool) {
    for(uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return true;
      }
    }
    return false;
   }

   // 获取候选人在数组中的位置
   function indexOfCandidate(bytes32 candidate) view public returns (uint) {
      for(uint i = 0; i < candidateList.length; i++) {
        if (candidateList[i] == candidate) {
           return i;
        }
      }
      return uint(-1);
  }


   // 购买发行的token
   function buy() payable public returns (uint) {
     //使用msg.value来读取用户的支付金额，这要求方法必须具有payable声明
      uint tokensToBuy = msg.value / tokenPrice;   //根据购买金额和通证单价，计算出购买量   
      require(tokensToBuy <= balanceTokens);       //继续执行合约需要确认合约的通证余额不小于购买量  
      voterInfo[msg.sender].voterAddress = msg.sender;    //保存购买人地址，一旦购买就是潜在投票者，将其加入投票者集合
      voterInfo[msg.sender].tokensBought += tokensToBuy;  //更新购买人持股数量
      balanceTokens -= tokensToBuy;                //将售出的通证数量从合约的余额中剔除  
      return tokensToBuy;                          //返回本次购买的通证数量
   }

    // 转移合约资金到指定账户
    // TODO 应该指定白名单
   function transferTo(address account) public {
      account.transfer(this.balance);
    }

  // 计算用户已经消耗的所有token
  function totalTokensUsed(uint[] _tokensUsedPerCandidate) private pure returns (uint) {
    uint totalUsedTokens = 0;
    for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
        totalUsedTokens += _tokensUsedPerCandidate[i];
    }
    return totalUsedTokens;
  }

  function tokensSold() view public returns (uint) {
    return totalTokens - balanceTokens;
  }

 function voterDetails(address user) view public returns (uint, uint[]) {
    return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
 }
}