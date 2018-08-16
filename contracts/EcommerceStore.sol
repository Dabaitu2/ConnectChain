pragma solidity ^0.4.13;

contract EcommerceStore {
	// 枚举类型标识状态变量
	enum ProductStatus { Open, Sold, Unsold }
 	enum ProductCondition { New, Used }

	struct Product {
		// 商品基本信息
		uint id; 			//商品编号,全局递增
		string name; 		//商品名称
		string category; 	//商品类别
		string imageLink;	//商品图片链接地址
		string descLink;	//商品描述连接地址
		// 拍卖相关信息
		uint auctionStartTime;	//拍卖开始时间
		uint auctionEndTime;	//拍卖截止时间
		uint startPrice;		//起拍价格
		address	highestBidder;	//出最高价者
		uint highestBid;		//最高出价
		uint secondHighestBid;	//次高出价
		uint totalBids;			//投标者人数
		// 商品状态
		ProductStatus status;		//商品销售状态
		ProductCondition condition;	//品相: 新品、二手
		// 出价信息
		// bids状态是一个嵌套的映射表，它将竞价者的账户地址映射到买家对该商品的密封出价表中
		// bytes32 代表密封出价的哈希值
		mapping (address => mapping (bytes32 => Bid)) bids;
	}

	// 每一条出价信息
	struct Bid {
  		address bidder;  //竞价者账户地址
  		uint productId;  //商品编号
  		uint value;      //支付的保证金
  		bool revealed;   //是否揭示过出价
	}

	// 买家出价
	function bid(
      uint _productId,  //商品编号
      bytes32 _bid      //密封出价哈希值
    ) payable public    //可接受资金支付
    returns (bool) {
		//利用商品编号提取商品数据
  		Product storage product = stores[productIdInStore[_productId]][_productId];
  		//当前还处于竞价有效期内
  		require (now >= product.auctionStartTime);
  		require (now <= product.auctionEndTime);
  		//支付的保证金高于商品起拍价
  		require (msg.value > product.startPrice);
  		//竞价人首次递交该出价
  		require (product.bids[msg.sender][_bid].bidder == 0);
  		//保存出价信息
  		product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
  		//更新竞价参与人数
  		product.totalBids += 1;
  		return true;
	}

	// 揭示真实出价
	function revealBid(
      uint _productId,  //商品编号
      string _amount,   //真实出价
      string _secret    //提交密封出价时使用的密文
    ) public {
		//利用商品编号提取商品数据
  		Product storage product = stores[productIdInStore[_productId]][_productId];
  		//确认拍卖已经截止
  		require (now > product.auctionEndTime);

  		//验证声称出价的有效性 计算哈希值
		//secret 应该是盐
  		bytes32 sealedBid = keccak256(_amount, _secret);
  		Bid memory bidInfo = product.bids[msg.sender][sealedBid];
		// 如果当前出价下存在记录并且价格没有被揭示
  		require (bidInfo.bidder > 0);
  		require (bidInfo.revealed == false);

  		uint refund; //返还金额
  		uint amount = stringToUint(_amount); //出价

  		if(bidInfo.value < amount) { //如果支付的保证金少于声称的出价，则视为失败
    		refund = bidInfo.value;
  		} else {
    		if (address(product.highestBidder) == 0) { //第一个揭示价格的竞价人，初始化最高价和次高价
     		 	product.highestBidder = msg.sender;
      			product.highestBid = amount;
      			product.secondHighestBid = product.startPrice;
      			refund = bidInfo.value - amount;
    		} else {
      			if (amount > product.highestBid) { //出价高于已知的最高出价
        			product.secondHighestBid = product.highestBid;
					// 将之前出最高价人的钱还回去
        			product.highestBidder.transfer(product.highestBid);
        			product.highestBidder = msg.sender;
        			product.highestBid = amount;
					// 设置退回的钱 = 保证金 - 实际报价
        			refund = bidInfo.value - amount;
      			} else if (amount > product.secondHighestBid) { //出价高于已知的次高出价
        			product.secondHighestBid = amount;
					// 全款退回，将次高价格设置为当前价格
        			refund = amount;
      			} else { //如果出价不能胜出前两个价格，则视为失败
        			refund = amount;
      			}
    		}
  		}
  		//更新当前用户出价揭示标志
  		product.bids[msg.sender][sealedBid].revealed = true;

  		if (refund > 0) { //原路返还保证金
    		msg.sender.transfer(refund);
  		}
	}

	// 将买家出价转换为整型数据
	function stringToUint(string s) pure private returns (uint) {
	  bytes memory b = bytes(s);
	  uint result = 0;
	  for (uint i = 0; i < b.length; i++) {
	    if (b[i] >= 48 && b[i] <= 57) {
	      result = result * 10 + (uint(b[i]) - 48);
	    }
	  }
	  return result;
	}

	// 展示最高出价结果 最高出价者，最高出价，次高出价
	function highestBidderInfo(uint _productId) view public returns (address, uint, uint) {
  		Product memory product = stores[productIdInStore[_productId]][_productId];
  		return (product.highestBidder, product.highestBid, product.secondHighestBid);
	}

	// 展示最终出价人数
	function totalBids(uint _productId) view public returns (uint) {
  		Product memory product = stores[productIdInStore[_productId]][_productId];
  		return product.totalBids;
	}

	// 所有卖家的商品信息，都保存在商品目录表, 也就是如下定义的合约的stores状态中。
	// 使用一个嵌套的mapping来区分不同卖家的商品：
	// 键为卖家的账户地址，值为另一个mapping —— 从商品编号到商品信息的映射：
	mapping (address => mapping(uint => Product)) stores;
	// 由于无法从上面的mapping中由值获取键也就是商家，故设置一个反查mapping来方便按照商品查询商家信息
	mapping (uint => address) productIdInStore;

	// 全局计数器，用来递增商品编号
	uint public productIndex;

	// 构造函数
	constructor() public {productIndex = 0;}

	// 商家上架新商品
	// 可视性声明为public 因为需要从外部调用这个方法
	function addProductToStore(
      string _name,           //Product.name - 商品名称
      string _category,       //Product.category - 商品类别
      string _imageLink,      //Product.imageLink - 商品图片链接
      string _descLink,       //Product.descLink - 商品描述文本链接
      uint _auctionStartTime, //Product.auctionStartTime - 拍卖开始时间
      uint _auctionEndTime,   //Product.auctionEndTime - 拍卖截止时间
      uint _startPrice,       //Product.startPrice - 起拍价格 
      uint _productCondition  //Product.productCondition - 商品品相
    ) public {
		//拍卖截止时间应当晚于开始时间
  		require (_auctionStartTime < _auctionEndTime);
  		//商品编号计数器递增
  		productIndex += 1;
  		// 构造Product结构变量
		// 在solidity中，局部变量例如product的默认存储位置是storage，也就是持久化的。 
		// 我们将product变量的存储位置声明为memory，是为了告诉EVM将其视为临时变量， 
		// 一旦函数执行完毕，EVM就会将它从内存中清除。
  		Product memory product = 
		  Product(
			  	productIndex,		// id
		   		_name, 				// 名字
		   		_category, 			// 类别
		   		_imageLink, 		// 图片链接
        		_descLink,			// 描述连接
				_auctionStartTime, 	// 拍卖开始时间
				_auctionEndTime,	// 拍卖结束时间
            	_startPrice, 		// 起拍价
				0, 0, 0, 0, 		// 最高出价者地址，最高出价，次高出价，出价人数
				ProductStatus.Open, // 默认开启商品竞拍状态
            	ProductCondition(_productCondition));	// 商品品相
  		//存入商品目录表                   
  		stores[msg.sender][productIndex] = product;
  		//保存商品反查表
  		productIdInStore[productIndex] = msg.sender;
	}

    // 查看商品信息
	// view关键字用来告诉以太坊虚拟机，
	// 这是一个只读的方法 —— 只读取合约的状态，
	// 而不会修改合约的状态。执行只读的方法不会消耗gas。
	function getProduct(
      uint _productId  //商品编号
    ) view public 
    returns (uint, string, string, string, string, uint, uint, uint, ProductStatus, ProductCondition) {
		// 利用商品编号提取商品信息，临时变量会在执行后被删除
		// 首先通过商品编号反查商家，然后通过商家中的商品编号来查看商品信息
  		Product memory product = stores[productIdInStore[_productId]][_productId];
  		//按照定义的先后顺序依次返回product结构各成员
  		return (product.id, product.name, product.category, product.imageLink, 
      			product.descLink, product.auctionStartTime,
      			product.auctionEndTime, product.startPrice, product.status, product.condition);
	}
}