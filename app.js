//app.js
var Bmob = require('utils/bmob.js')
var WXBizDataCrypt = require('./utils/RdWXBizDataCrypt');
var config = require("./config");


// var BmobSocketIo = require('utils/bmobSocketIo.js').BmobSocketIo;
// const BmobSocketIo = require('utils/tunnel');
Bmob.initialize(
  '56b094be8e3f14b563d5c13511d529d5',
  '4ca347b96424d71794c8843e691b807d'
)


App({
  onLaunch: function() {
 
    var that = this;
    //this.getUserInfo();
    var user = new Bmob.User(); //开始注册用户
    console.log("new user id ", user.id);
    //user.auth();
    
      var that = this;

      // wx.login({
      //   success: function (res) {

      //     user.loginWithWeapp(res.code).then(
      //       function (user) {
      //         console.log("login user", user);

      //         var openid = user.get('authData').weapp.openid;
      //         var userInfo = user.get("authData");
      //         that.initGlobalData(user);
      //         //wx.setStorageSync('openid', openid);
      //         wx.setStorageSync('userInfo', userInfo);
      //       }, 
      //       function(err){
      //         console.log("登陆失败", err);
      //       }

      //     )
      //   }
      // })
      
        


    //user.getUserInfo();

    // wx.login({

    //   success: function (res) {
    //     user.loginWithWeapp(res.code).then(function (user) {
    //       var openid = user.get("authData").weapp.openid;
    //       console.log(user, 'user', user.id, res);
    //       if (user.get("nickName")) {

    //         // 第二次登录，打印用户之前保存的昵称
    //         console.log(user.get("nickName"), 'res.get("nickName")');
    //         that.initGlobalData(user);

    //         //更新openid
    //         wx.setStorageSync('openid', openid)
    //       } else {//注册成功的情况

    //         //保存用户其他信息，比如昵称头像之类的
    //         wx.getUserInfo({
    //           success: function (result) {

    //             var userInfo = result.userInfo;
    //             var nickName = userInfo.nickName;
    //             var avatarUrl = userInfo.avatarUrl;

    //             var u = Bmob.Object.extend("_User");
    //             var query = new Bmob.Query(u);
    //             // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
    //             query.get(user.id, {
    //               success: function (result) {
    //                 // 自动绑定之前的账号

    //                 result.set('nickName', nickName);
    //                 result.set("userPic", avatarUrl);
    //                 result.set("openid", openid);
    //                 result.set("password", openid);
    //                 result.set("userData", userInfo);
    //                 result.save();

    //               }
    //             });

    //           }
    //         });


    //       }

    //     }, function (err) {
    //       console.log(err, 'errr');
    //     });

    //   }
    // });
  
    //user.auth()
  },



  getUserInfo: function(cb) {
    return;
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == 'function' && cb(that.globalData.userInfo);
            },
            fail: function(res){
              wx.showModal({
                title: '请求',
                content: '请点击 允许，否则程序不能正常允许！',
              })

              wx.openSetting({
                success: function (res) {
                  if (!res.authSetting["scope.userInfo"]) {
                    //这里是授权成功之后 填写你重新获取数据的js
                    //参考:
                    that.getUserInfo();
                  }
                }
              })
            }
          })
        }
      })
    }
  },

  //初始化全局变量 
  initGlobalData: function (user){
    var userInfo = user.get("authData");
    var openid = user.get('authData').weapp.openid
    wx.setStorageSync('openid', openid)
    var that = this;
    var query = new Bmob.Query(Bmob.User);
    
    query.get(user.id, {
      success: function (result) {
        if(!result){
          console.log("result is null");
          return;

        }
        that.globalData.userInfo = userInfo;
        that.globalData.phoneNumber = result.get("mobilePhoneNumber");
        that.globalData.realName = result.get("realName");
        if (that.globalData.realName) {
          wx.setStorageSync("realName", that.globalData.realName);
        }

        if (that.globalData.phoneNumber) {
          wx.setStorageSync("phoneNumber", that.globalData.phoneNumber);
        }

      },
      error: function (result, error) {
        console.log("查询失败");
      }
    });

   },

  globalData: {
    userInfo: null,
    phoneNumber: null,
    realName: null

  }
})


      // {
      //   "pagePath": "pages/interface/interface",
      //   "iconPath": "image/icon_API.png",
      //   "selectedIconPath": "image/icon_API_HL.png",
      //   "text": "常用接口"
      // },
      // {
      //   "pagePath": "pages/index/index",
      //   "iconPath": "image/list.png",
      //   "selectedIconPath": "image/list1.png",
      //   "text": "日记管理"
      // },