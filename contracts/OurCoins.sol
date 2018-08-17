pragma solidity ^0.4.18;

contract OurCoins {
	
	// 存在链上的用户
	// 不含任何后缀的默认单位是wei,用户发来的货币会被自动转化成wei
	struct User {
		uint256		userId;			//用户Id
		address 	userAddress;	//用户地址
		uint		tokensBought;	//用户购买的通证总量
		uint		tokensBalance;  //用户目前还有的通证总量
		uint		createTime;		//用户上链的时间
		mapping (uint256 => Problem) ownQuestionList; //用户发起的问题映射
		mapping (uint256 => uint256) answerQuestionList; //用户回答的问题映射(映射到自己)		
		// 问题编号到地址的映射
		// 这个地址是问题传播来源者的地址, 
		// 一个用户一个问题下只能有一个问题传播来源者
		mapping (uint256 => uint256) questionRoutes; 
	}
	// 每一条问题的详细信息
	struct Problem {
		uint256 problemId;	// 问题的唯一ID
		uint	createTime; // 问题的创建时间
		uint	limit;		// 问题的限制解答时间
		bool	finished;	// 问题是否解决
		uint 	inqurier;	// 问题的发起者
		uint 	answer;		// 问题的解决者
		uint    offer;		// 悬赏金额
		uint    helpNum;    // 帮助人数
		uint    model;		// 分成模式
		uint[]  transferList;	 // 转发者的id集合
		uint[]  answerList; 	 // 回答者的id集合
	}
	// 用户id到用户信息的映射
	mapping (uint => User) public UserInfo;
	// 问题Id到问题信息的映射
	mapping (uint => Problem) public ProblemDetail;
	// 用户地址到到用户信息的映射
	mapping (address => User) public userAddressInfo;

	uint public totalTokens;   			//发行的总价
	uint8 public decimals = 10;   		//支持的代币最小单位	
  	uint public balanceTokens; 			//剩余可以交易的token数量
  	uint public tokenPrice;	   			//Token 单价
	address public platformAddress; 	// 平台的以太坊地址
	uint public unTaxedpool;  			// 还没有被平台提成的资金池数目
	uint public lastCleanTime;			// 上次重置unBindUsers的时间
	mapping  (uint => uint) unBindUsers; // 还没有绑定地址的用户集合 递增参数=>用户id
	uint unBindUserNumber = 0;
	uint[] compartmentalized = [8, 7, 6, 5];  // 枚举用户指定的分成模式
	uint80 constant None = uint80(0); 		  // 制定常量Null
	mapping (uint => mapping (uint => uint)) transfer;  // 每个回答下回答者前一环的转发者自己向自己的映射
	

	// tokens 发行的总token数
	// pricePerToken 单价, 以wei计数
	constructor(uint tokens, uint pricePerToken, address platform) payable public {
		totalTokens = tokens * 10 ** uint256(decimals);
    	balanceTokens = tokens * 10 ** uint256(decimals);
    	tokenPrice = pricePerToken;
		platformAddress = platform;
		unTaxedpool = 0;
		lastCleanTime = now;
	}


    // Id获取地址
	function AddressOf(uint userId) public view returns (address) {
		return UserInfo[userId].userAddress;
	}
	
	// 地址获取Id
	function IdOf(address userAddress) public view returns (uint) {
	    return userAddressInfo[userAddress].userId;
	}

	// Id计算代币持有者的代币剩余量
	function balanceOf(uint tokenOwner) public view returns (uint) {
		return UserInfo[tokenOwner].tokensBalance;
	}
	
	// 地址计算代币持有者的代币剩余量
	function balance(address addr) public view returns (uint) {
	    return userAddressInfo[addr].tokensBalance;
	}

	// 用户注册后免费送一些币
	function sendFree(uint userId) payable public returns (uint) {
		require(UserInfo[userId].userId==None);
		UserInfo[userId].userId = userId;
		UserInfo[userId].tokensBought += 50 * 10 ** uint256(decimals);
		UserInfo[userId].tokensBalance += 50 * 10 ** uint256(decimals);
		balanceTokens -= 50 * 10 ** uint256(decimals);
		unBindUserNumber += 1;
		unBindUsers[userId] = userId;
		return 50 * 10 ** uint256(decimals);
	}

	// 收回一直没绑定以太坊地址的用户的token
	function reBack() public returns (bool) {
		uint tempNum = unBindUserNumber;
		for (uint i=0; i < tempNum; i++) {
			if (now >= 7 * 1 days + UserInfo[unBindUsers[i]].createTime) {
				uint tokens = UserInfo[unBindUsers[i]].tokensBought;
				UserInfo[unBindUsers[i]].tokensBought = 0;
				UserInfo[unBindUsers[i]].tokensBalance = 0;
				balanceTokens += tokens;
				delete UserInfo[unBindUsers[i]]; 				
				delete unBindUsers[i];
				unBindUserNumber -= 1;
			}
		}
		return true;
	}
	// 用户完成绑定
	function bindAddress(uint userId, address userAddress) public payable returns (bool) {
    //      require(msg.sender == AddressOf(userId)); 
			UserInfo[userId].userAddress = userAddress;
			userAddressInfo[userAddress] = UserInfo[userId];
			// 测试给用户发点以太币, 方便提现
			AddressOf(userId).transfer(100000000000000000);
			uint tempNum = unBindUserNumber;
			for (uint i=0; i < tempNum; i++) {
				if (unBindUsers[i] == userId) {
					delete unBindUsers[i];
					unBindUserNumber -= 1;
					return true;
				}
			}
			return false;
	}

	// 用户更换绑定地址
	function changeAddress(uint userId, address new_userAddress) public payable returns (bool) {
	    require(msg.sender == AddressOf(userId));   
	   	delete userAddressInfo[UserInfo[userId].userAddress];
		UserInfo[userId].userAddress = new_userAddress;
		userAddressInfo[new_userAddress] = UserInfo[userId];
		return true;
	}

	// 购买发行的token
	// userId 购买人的Id
   function buy(uint userId) payable public returns (uint) { 
     //使用msg.value来读取用户的支付金额，这要求方法必须具有payable声明
      require(msg.value > tokenPrice);
   //   测试情况下这一步不需要
   //   require(msg.sender == AddressOf(userId) || AddressOf(userId) == None);
      uint tokensToBuy = msg.value / tokenPrice * 10 ** uint256(decimals);  //根据购买金额和通证单价，计算出购买量   
      require(tokensToBuy <= balanceTokens);       							//继续执行合约需要确认合约的通证余额不小于购买量  
    //  userAddressInfo[msg.sender].userAddress = msg.sender;   				//保存购买人地址，一旦购买token就是潜在发问者，将其加入集合
    //  userAddressInfo[msg.sender].userId = userId;    						//更新购买人的Id	  
      UserInfo[userId].tokensBought += tokensToBuy;  			//更新购买人持有通证的数量
      UserInfo[userId].tokensBalance += tokensToBuy; 			//更新购买人持有通证的数量
      userAddressInfo[msg.sender] =  UserInfo[userId];			
      balanceTokens -= tokensToBuy;                							//将售出的通证数量从合约的余额中剔除  
      return tokensToBuy;                          							//返回本次购买的通证数量
   }
   // 提现账户的Token
   // userId 提现用户的帐号
   // coins		  用户提现金额
   function sell(uint userId, uint coins) payable public returns (uint) {
      //使用msg.value来读取用户的支付金额，这要求方法必须具有payable声明
	  //获取wei格式的提现金额
	  // require(msg.sender == AddressOf(userId)); 
	  uint WeiToSell 		= coins * tokenPrice;
	 // require(coins * 10 ** uint256(decimals) <= UserInfo[userId].tokensBalance); 		// 提现金额不能超过持有量
	  uint tax 		 		= WeiToSell / 105 * 5;  			                        // 收取手续费以抵平油资
	  unTaxedpool		   	+= tax;
	  WeiToSell		 		= WeiToSell - tax;		 							        // 实际的提现金额
	  UserInfo[userId].tokensBalance -= coins * 10 ** uint256(decimals);  				// 用户代币减少
	  balanceTokens 		+= coins * 10 ** uint256(decimals);       				    // 将提现的token数量增补到合约的余额中  		
	  AddressOf(userId).transfer(WeiToSell);					// 转账给用户
	  return WeiToSell;
   }
   // 发起问题并预先支付赏金
   // userId 用户id
   // coins 发起的赏金金额
   // problemId 问题Id
   // model		指定的分成模式
	function publish(uint userId, uint coins, uint256 problemId, uint limit, uint model) payable public returns (uint) {
	    require(msg.sender == AddressOf(userId)); 
		// 将token转化成wei方便使用
		uint coinsInWei = coins * tokenPrice;
		// 平台抽取5%的提成
		uint tax		= coinsInWei / 105 * 5;
		require(platformAddress != 0x0);
 		unTaxedpool		+= tax;
		coinsInWei 		= coinsInWei - tax;
		coins = coinsInWei / tokenPrice;

		// 提出代币
		UserInfo[userId].tokensBought -= coins*10**uint256(decimals);
		UserInfo[userId].tokensBalance -= coins*10**uint256(decimals);

		// 更新用户的问题列表
        UserInfo[userId].ownQuestionList[problemId].problemId = problemId;
        UserInfo[userId].ownQuestionList[problemId].finished = false;
        UserInfo[userId].ownQuestionList[problemId].inqurier = userId;
        UserInfo[userId].ownQuestionList[problemId].offer = coins;
        UserInfo[userId].ownQuestionList[problemId].limit = limit;		
        UserInfo[userId].ownQuestionList[problemId].createTime = block.timestamp;
        UserInfo[userId].ownQuestionList[problemId].helpNum = 0;
        UserInfo[userId].ownQuestionList[problemId].model = model;		
        ProblemDetail[problemId] = UserInfo[userId].ownQuestionList[problemId];
		return  coins;
	}
	// 转发并进行记录
	// helpType 帮助类型 0为转发 1为回答
	function answerOrTransfer(uint userId, uint lastId, uint256 problemId, uint helpType) public payable returns (bool) {
	//  require(msg.sender == AddressOf(userId)); 
	    require(userId != lastId);
		require(ProblemDetail[problemId].finished==false);
		require(ProblemDetail[problemId].inqurier!=userId);
		require(now < ProblemDetail[problemId].createTime + ProblemDetail[problemId].limit * 1 days);
		ProblemDetail[problemId].helpNum += 1;		
		if(helpType == 0) {
			// 转发
		//	require(UserInfo[userId].questionRoutes[problemId] == None);
			UserInfo[userId].questionRoutes[problemId] = lastId;
			ProblemDetail[problemId].transferList.push(userId);
		} else {
			// 回答
		//	require(UserInfo[userId].answerQuestionList[problemId] == None);
		    UserInfo[userId].questionRoutes[problemId] = lastId;
			ProblemDetail[problemId].answerList.push(userId);
			UserInfo[userId].answerQuestionList[problemId] = problemId;
		}
		return true;
	}
	//	用户采纳答案
	//  model 用户采取的分成模式 [model=0]=>8  [model=1]=>7 [model=2]=>6 [model=3]=>5 
	function chooseAnwser(uint userId, uint256 problemId, uint ansId) payable public {
		require(ProblemDetail[problemId].finished == false);
	    require(msg.sender == AddressOf(userId)); 
		require(ProblemDetail[problemId].inqurier == userId);
		ProblemDetail[problemId].finished = true;
		ProblemDetail[problemId].answer = ansId;
		uint model = ProblemDetail[problemId].model;
		uint money = ProblemDetail[problemId].offer * 10 ** uint256(decimals);

		uint moneyForAnswer = money * compartmentalized[model] / 10;
		uint moneyForTransfer = (money - moneyForAnswer);
		
		// 找寻用户路径
		uint nowUser = ansId;
		uint len = 0;
	    uint all = 0; // 越到后面收益越高
		while(UserInfo[nowUser].questionRoutes[problemId]!=userId){
			nowUser = UserInfo[nowUser].questionRoutes[problemId];
			len += 1;
			all += len * 1; // ratio
		}
		UserInfo[ansId].tokensBought += moneyForAnswer;
		UserInfo[ansId].tokensBalance += moneyForAnswer;
		
		if(len > 0){
		    moneyForTransfer = moneyForTransfer / all;
		    nowUser = ansId;
		    while(UserInfo[nowUser].questionRoutes[problemId]!=userId ){
			    nowUser = UserInfo[nowUser].questionRoutes[problemId];
			    UserInfo[nowUser].tokensBought += moneyForTransfer * len;
		        UserInfo[nowUser].tokensBalance += moneyForTransfer * len;
		        len -= 1;
		    }
		} else {
		    balanceTokens += moneyForTransfer;
		}
		
	}
	
	// 不采纳任何问题就退钱
	function NoAnswer(uint userId, uint problemId) public {
		require(now > ProblemDetail[problemId].createTime + ProblemDetail[problemId].limit * 1 days);
		uint money = ProblemDetail[problemId].offer * 10 ** uint256(decimals);
		uint moneyForRefund = money * 8 / 10;
		UserInfo[userId].tokensBalance += moneyForRefund;
		UserInfo[userId].tokensBought += moneyForRefund;
		uint moneyForTransfer = (money - moneyForRefund);
		// 回答者和回答者的前一个人拿钱
		uint totalNum = ProblemDetail[problemId].answerList.length;
		uint nowAnswer;
		uint lastTransfer;
		for (uint i=0; i<ProblemDetail[problemId].answerList.length; i++) {
			 nowAnswer = ProblemDetail[problemId].answerList[i];
			 lastTransfer = UserInfo[nowAnswer].questionRoutes[problemId];
			if(transfer[problemId][lastTransfer] == None) {
				totalNum += 1;
				transfer[problemId][lastTransfer] = lastTransfer;				
			}
		}
		uint perBouns = moneyForTransfer / totalNum;
// 		delete it!!!! transfer[problemId];
        for (i = 0; i< ProblemDetail[problemId].answerList.length; i++){
            nowAnswer = ProblemDetail[problemId].answerList[i];
            lastTransfer = UserInfo[nowAnswer].questionRoutes[problemId];
            delete transfer[problemId][lastTransfer];
        }


		uint lastAgainTransfer;
		for (uint j= 0; j < ProblemDetail[problemId].answerList.length; j++) {
			nowAnswer = ProblemDetail[problemId].answerList[j];
			UserInfo[nowAnswer].tokensBalance += perBouns;
			UserInfo[nowAnswer].tokensBought += perBouns;			
			lastAgainTransfer = UserInfo[nowAnswer].questionRoutes[problemId];
			if(transfer[problemId][lastAgainTransfer] == None) {
				transfer[problemId][lastAgainTransfer] = lastAgainTransfer;
				UserInfo[lastAgainTransfer].tokensBalance += perBouns;
				UserInfo[lastAgainTransfer].tokensBought += perBouns;	
			}
		}
		ProblemDetail[problemId].finished = true;
	}

	// 平台收取合约中积累的手续费
	function getTax()  public payable returns (bool) {
		require(unTaxedpool >= 100 ether);
		require(platformAddress != 0x0);
		platformAddress.transfer(unTaxedpool);
		unTaxedpool = 0;
		return true;
	}
	
	function tokensSold() view public returns (uint) {
    	return totalTokens - balanceTokens;
  	}

 	function UserDetails(uint userId) view public returns (uint, uint) {
   	 	return (UserInfo[userId].tokensBought, UserInfo[userId].tokensBalance);
 	}
}