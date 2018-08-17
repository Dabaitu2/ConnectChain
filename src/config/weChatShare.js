/**
 *    Created by tomokokawase
 *    On 2018/7/30
 *    阿弥陀佛，没有bug!
 */

import wx from 'weixin-js-sdk';
import $ from 'jquery';
import Cookies from 'js-cookie';


export const initWechat = function () {
    var url = window.location.href;
    var search = url.split('share?')[1];
    console.log(search);
    var ID = search.split('&ID=')[1];
    var questionID = search.split('questionID=')[1].split('&previousID=')[0];
    var previousID = search.split('&previousID=')[1].split('&ID=')[0];
    // todo 这个是自己写的，不是别人给的...
    $.get('/wechatShare', {url: url}, function (data) {
        data = JSON.parse(JSON.parse(JSON.stringify(data)));
        var appId = data.appId;
        var timestamp = data.timestamp;
        var nonceStr = data.nonceStr;
        var signature = data.signature;
        var jsApiList = data.jsApiList;
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: appId, // 必填，公众号的唯一标识
            timestamp: timestamp, // 必填，生成签名的时间戳
            nonceStr: nonceStr, // 必填，生成签名的随机串
            signature: signature,// 必填，签名
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']//jsApiList // 必填，需要使用的JS接口列表
        });
        wx.ready(function () {
            //分享到朋友圈
            wx.onMenuShareTimeline({//分享到朋友圈
                title: '链脉', // 分享标题
                desc: '您朋友的朋友总能帮上忙', // 分享描述
                link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致//url,
                imgUrl: 'http://www.uchuangbang.com/statics/img/logo.png', // 分享图标
                success: function () {
                    //分享成功,记录分享
                    $.get('http://www.uchuangbang.com/login/checkID', {ID: (Cookies.get("ID"))}, () => {
                        $.post('http://www.uchuangbang.com/questions/toForward',
                            {
                                questionID: questionID,
                                previousID: previousID,
                                ID: ID
                            },
                            function (data) {
                                if (JSON.parse(JSON.stringify(data)).ans == "success") {
                                    // TODO 引入转发进入区块链哈

                                    alert("分享成功，记录分享成功！");
                                } else if(JSON.parse(JSON.stringify(data)).ans == "keep"){
                                    alert("分享成功！");
                                } else {
                                    alert("分享成功！但记录分享失败");
                                }
                            });
                    });

                },
                cancel: function () {
                    //取消了分享
                    alert("取消了分享！");
                }
            });
            //分享到朋友
            wx.onMenuShareAppMessage({
                title: '链脉', // 分享标题
                desc: '您朋友的朋友总能帮上忙', // 分享描述
                link: url,//'http://www.uchuangbang.com', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: 'http://www.uchuangbang.com/statics/img/logo.png', // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    //分享成功,记录分享
                    $.get('http://www.uchuangbang.com/login/checkID', {ID: (Cookies.get("ID"))}, () => {
                        $.post('http://www.uchuangbang.com/questions/toForward', {
                            questionID: questionID,
                            previousID: previousID,
                            ID: ID
                        }, function (data) {
                            if (JSON.parse(JSON.stringify(data)).ans == "success") {
                                // TODO 引入转发进入区块链哈
                                alert("分享成功，记录分享成功！");
                            } else if(JSON.parse(JSON.stringify(data)).ans == "keep"){
                                alert("分享成功！");
                            } else {
                                alert("分享成功！但记录分享失败");
                            }
                        });
                    });

                },
                cancel: function () {
                    //取消了分享
                    alert("取消了分享！");
                }
            });
            //分享到QQ
            wx.onMenuShareQQ({
                title: '链脉', // 分享标题
                desc: '您朋友的朋友总能解决', // 分享描述
                link: url, // 分享链接
                imgUrl: 'http://www.uchuangbang.com/statics/img/logo.png', // 分享图标
                success: function () {
                    //分享成功,记录分享
                    $.get('http://www.uchuangbang.com/login/checkID', {ID: (Cookies.get("ID"))}, () => {
                        $.post('http://www.uchuangbang.com/questions/toForward', {
                            questionID: questionID,
                            previousID: previousID,
                            ID: ID
                        }, function (data) {
                            if (JSON.parse(JSON.stringify(data)).ans == "success") {
                                // TODO 引入转发进入区块链哈
                                alert("分享成功，记录分享成功！");
                            } else if(JSON.parse(JSON.stringify(data)).ans == "keep"){
                                alert("分享成功！");
                            } else {
                                alert("分享成功！但记录分享失败");
                            }
                        });
                    });

                },
                cancel: function () {
                    alert("取消了分享！");
                }
            });
            //分享到QQ空间
            wx.onMenuShareQQ({
                title: '链脉', // 分享标题
                desc: '您朋友的朋友总能帮上忙', // 分享描述
                link: url, // 分享链接
                imgUrl: 'http://www.uchuangbang.com/statics/img/logo.png', // 分享图标
                success: function () {
                    //分享成功,记录分享
                    $.get('http://www.uchuangbang.com/login/checkID', {ID: (Cookies.get("ID"))}, () => {
                        $.post('http://www.uchuangbang.com/questions/toForward', {
                            questionID: questionID,
                            previousID: previousID,
                            ID: ID
                        }, function (data) {
                            if (JSON.parse(JSON.stringify(data)).ans == "success") {
                                // TODO 引入转发进入区块链哈
                                alert("分享成功，记录分享成功！");
                            } else if(JSON.parse(JSON.stringify(data)).ans == "keep"){
                                alert("分享成功！");
                            } else {
                                alert("分享成功！但记录分享失败");
                            }
                        });
                    });

                },
                cancel: function () {
                    alert("取消了分享！");
                }
            });
        });
        wx.error(function (res) {
            $("#we").append("有问题");
        });

    })
};