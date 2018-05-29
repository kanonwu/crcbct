// pages/ct/yc/yc.js
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt');
var config = require("../../../config");
var util = require('../../../utils/util.js'); 

var ctCodeIndex = [9, 16, 3, 19];

var ctList = {
  4000:"总行餐厅",
  4005:"营业部",
  4006:"城北支行",
  4007:"岑城支行",
  4008:"城中支行",
  4009:"波塘支行",
  4011: "南渡支行",
  4012: "马路支行",
  4014: "昙容支行",
  4018: "水汶支行",
  4019: "大隆支行",
  4021: "梨木支行",
  4023: "归义支行",
  4025: "大业支行",
  4027:"筋竹支行",
  4029: "诚谏支行",
  4031: "糯垌支行",
  4032: "新塘支行",
  4033: "安平支行",
  4035: "三堡支行",
  4038: "广场支行",
  4042: "城东支行",  
  4046: "新圩分理处",
  4050: "思湖支行",
  4051: "文化支行"
}

const BREAKFAST = 1; //早餐  10点前
const LUNCH = 2; //早餐  16点前
const SUPPER = 3; //晚餐  16点后

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    inputInfo : true,
    //今日用记录
    todayRecord : [],
    realName: null,
    phoneNuber: null,
    //早餐报餐人数
    zcOrderCount: 0,
    //午餐报餐人数
    wcOrderCount: 0,
    //早餐用餐人数
    zcYcCount: 0,
    //午餐用餐人数
    wcYcCount: 0,
    ctCode: 4000,
    ctName: "总行"

  },

  bindGetUserInfo: function(e){
    console.log("getuserinfo" , e.detail.userInfo);
  },


//查询报餐和用餐人数
  setCount: function(){
    var that = this;
    var YcOrder = Bmob.Object.extend("YcOrder");
    var order = new YcOrder();
    let date = new Date//当前日期

    var hour = date.getHours();

    let year = date.getFullYear()//当前年

    let month = date.getMonth() + 1//当前月份
    let day = date.getDate()//当天

    var ctCode = wx.getStorageSync("ctCode");
    var ctName = wx.getStorageSync("ctName");
    

    //查询报餐 早餐
    var query = new Bmob.Query(YcOrder);
    query.equalTo("ctCode", ctCode);
    query.equalTo("year", year);
    query.equalTo("month", month);
    query.equalTo("day", day);
    var orderType = BREAKFAST;
    query.equalTo("orderType", orderType);
    query.count({
      success: function(count){
        that.setData({
          zcOrderCount: count
        })

      }
    })

  //查询午餐报餐人数
    query = new Bmob.Query(YcOrder);
    query.equalTo("ctCode", ctCode);
    query.equalTo("year", year);
    query.equalTo("month", month);
    query.equalTo("day", day);
    var orderType = LUNCH;
    query.equalTo("orderType", orderType);
    query.count({
      success: function (count) {
        that.setData({
          wcOrderCount: count
        })

      }
    })

    //查询用餐

    var YcRecord = Bmob.Object.extend("YcRecord");
    var record = new YcOrder();
    var queryRecord = new Bmob.Query(YcRecord);
    var now = new Date();
    var today = util.formatDay(now, "-");

  //早餐 
    queryRecord.equalTo("ctCode", ctCode);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": today + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": today + " 23:59:59" } } }]);
    //queryRecord.equalTo("ctCode", "4000");
    //queryRecord.containedIn("ctCode",["4000", "4005", "4006", "4007", "4008", "4038", "4050", "4051"]);
    queryRecord.equalTo("ycType", BREAKFAST);
    
    queryRecord.count({
      success: function(count){
        that.setData({
          zcYcCount: count
        })
      }
    })

      queryRecord = new Bmob.Query(YcRecord);
      //午餐 10点到15点59
      //queryRecord.equalTo("ctCode", "4000");
      queryRecord.equalTo("ctCode", ctCode);
      //queryRecord.containedIn("ctCode",["4000", "4005", "4006", "4007", "4008", "4038", "4050", "4051"]);
      queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": today + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": today + " 23:59:59" } } }]);
      queryRecord.equalTo("ycType", LUNCH);
      queryRecord.count({
        success: function (count) {
          that.setData({
            wcYcCount: count
          })
        }
      })
   
  },

//解码二维码
  decodeQrCode: function(qrCode){
    var str = "";
    for (var i = 0; i < ctCodeIndex.length; i++) {
      str = str + qrCode.substring(ctCodeIndex[i], ctCodeIndex[i]+1);
    }
    return str;
  },

//得到二维码字符串
  getCtQrCode:function (len, indexs, values) {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for(var i = 0; i<len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }

    var str = randomString;

    for(var i = 0; i < indexs.length; i++){
      str = str.substring(0, indexs[i]) + values.charAt(i) + str.substring(indexs[i] +1, str.length);
    }

    return str;
  },

  //更新今日用餐记录 {序号，姓名，时间，餐厅}
  updateTodayRecord : function(){
    var that = this;
    var td = new Array();
    var user = Bmob.User.current();
    if (typeof(user.id) === undefined){
      return;
    }

    if(!user.id){
      return;
    }
    var YcRecord = Bmob.Object.extend("YcRecord");
    var query = new Bmob.Query(YcRecord);

    var now = new Date();
    var today = util.formatDay(now, "-");
    var tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    var strTmo = util.formatDay(tomorrow, "-");
    //console.log("today=", today, "tomorrow=", strTmo);
    var openid = user.attributes.authData.weapp.openid;


    query.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": today + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": today +" 23:59:59" } } }]);
    query.equalTo("openid", openid);
    query.descending("createdAt");
    
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        that.setData({todayRecord: results});
        // 循环处理查询到的数据
        
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

    //更新用餐人数
    that.setCount();

  },


  //初始化全局变量 
  initGlobalData: function (user) {
    var that = this;
    var userInfo = user.get("authData");
    var openid = user.get('authData').weapp.openid
    wx.setStorageSync('openid', openid)
    var realName = user.get("realName");
    var phoneNumber = user.get("mobilePhoneNumber");
    if(realName){
      getApp().globalData.userInfo = userInfo;
      getApp().globalData.phoneNumber = phoneNumber;
      getApp().globalData.realName = realName;
      wx.setStorageSync("realName", realName);
      wx.setStorageSync("phoneNumber", phoneNumber);
    }else{
      var query = new Bmob.Query(Bmob.User);
      query.get(user.id, {
        success: function (result) {
          if (!result) {
            console.log("result is null");
            return;
          }
          getApp().globalData.userInfo = userInfo;
          getApp().globalData.phoneNumber = result.get("mobilePhoneNumber");
          getApp().globalData.realName = result.get("realName");
          if (getApp().globalData.realName) {
            wx.setStorageSync("realName", getApp().globalData.realName);
          }

          if (getApp().globalData.phoneNumber) {
            wx.setStorageSync("phoneNumber", getApp().globalData.phoneNumber);
          }

        },
        error: function (result, error) {
          console.log("查询失败");
        }
      });
    }


  },

//检查是否是总行餐厅
isCenterCt: function(ctCode){
    var centerCodes = ["4000", "4005", "4006", "4007", "4008", "4038", "4050", "4051"];
    for (var i = 0; i < centerCodes.length; i++) {
      if(ctCode == centerCodes[i]){
        return true;
      }
    }

    return false;
},

//初始化所属餐厅
initBelongCt: function(){
  var that = this;
  var actCode = wx.getStorageSync("ctCode");
  var actName = wx.getStorageSync("ctName");
  //没有分配所属餐厅
  if(actCode == null || actCode.length < 4){
    //从最新的用处记录获取所属餐厅
    var openid = wx.getStorageSync("openid");
    if (openid == null) {
      return;
    }

    var YcRecord = Bmob.Object.extend("YcRecord");
    var query = new Bmob.Query(YcRecord);
    query.equalTo("openid", openid);
    query.descending("createdAt");
    query.find({
      success: function (results) {
        if (results.length == 0) {
          //若没有用餐记录，默认是总行餐厅
          actCode = 4000;
          actName = "总行";
        } else {
          var record = results[0];
          actCode = record.get("ctCode");
          actName = record.get("ctName");
          if(that.isCenterCt(actCode)){
            actCode = 4000;
            actName = "总行";
          }
        }
        that.setData({ ctCode: actCode, ctName: actName });
      },
      error: function (error) {
        console.log("查询失败: " + error);
      }
    });
  }else{
    if (that.isCenterCt(actCode)) {
      actCode = 4000;
      actName = "总行";
    }

    that.setData({ ctCode: actCode, ctName: actName });
  }
},

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function ( ) {
    var that = this;
    //检查姓名和手机号码是否已填写
    var cuser = Bmob.User.current();
    if(!cuser){
      console.log("开始登陆流程");
      var user = new Bmob.User(); //开始注册用户
      wx.login({
        success: function (res) {

          user.loginWithWeapp(res.code).then(
            function (user) {
              console.log("login user", user);

              var openid = user.get('authData').weapp.openid;
              var userInfo = user.get("authData");
              that.initGlobalData(user);
              //wx.setStorageSync('openid', openid);
              wx.setStorageSync('userInfo', userInfo);
              var realName = wx.getStorageSync('realName');
              if (realName) {
                that.setData({ inputInfo: false });
              }
              that.initBelongCt();
              that.updateTodayRecord();
            },
            function (err) {
              console.log("登陆失败", err);
            }

          )
        }
      })
    }else{
      // console.log("已登录222222222222222", cuser);
      var openid = cuser.get('authData').weapp.openid;
      var userInfo = cuser.get("authData");

      that.initGlobalData(cuser);
      //wx.setStorageSync('openid', openid);
      wx.setStorageSync('userInfo', userInfo);
      var realName = wx.getStorageSync('realName');
      var realName = wx.getStorageSync('openid');

      console.log("onShow realName=", realName);
      console.log("onShow userid", cuser);
      if (realName) {

        that.setData({ inputInfo: false });
      }
      that.initBelongCt();
      that.updateTodayRecord();
    }
  },
  

//保存用户名和手机号码 
  saveNamePhone: function(event){
    var that = this;
    console.log("event =", event);
    console.log("caniuse", this.data.canIUse);
    if(event.type == "getuserinfo"){
      var userinfo = event.detail.userInfo;
      wx.setStorageSync("userInfo", userinfo);
      console.log("获取用户消息");

      //保存昵称和头像
      var cuser = Bmob.User.current();
      console.log("current user -", cuser);
      var User = Bmob.Object.extend("_User");
      var query = new Bmob.Query(User);

      console.log("cuser.id", cuser.id);
      query.get(cuser.id, {
        success: function (result) {
          console.log("保存昵称和头像" , result);
              result.set('nickName', userinfo.nickName);
              result.set("userPic", userinfo.avatarUrl);
              result.save();
        },
        error: function (result, error) {
          console.log("查询失败");
        }
      });
      return;
    }

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log("getuserinfo",res.userInfo);
              var pn = String(event.detail.value.phoneNumber);
              var rn = String(event.detail.value.realName);
              if (rn == null || rn.length < 2) {
                wx.showModal({
                  title: '提示',
                  content: '请输入真实姓名。',
                  showCancel: false,
                });
                return;
              }

              if (pn == null || pn.length < 2) {
                wx.showModal({
                  title: '提示',
                  content: '请输入手机号码。',
                  showCancel: false,
                });
                return;
              }

              //that.setData({realName: rn, phoneNumber: pn});
              var openid = wx.getStorageSync('openid')
              var cuser = Bmob.User.current();
              console.log("current user -", cuser);
              var User = Bmob.Object.extend("_User");
              var query = new Bmob.Query(User);
              
              console.log("cuser.id", cuser.id);
              query.get(cuser.id, {
                success: function (result) {
                  console.log("result1=", result.get("mobilePhoneNumber"));
                  console.log("realName", rn);
                  console.log("phone", pn);
                  result.set("realName", rn);
                  result.set("mobilePhoneNumber", pn);
                  result.set("mobilePhoneNumberVerified", pn);
                  result.set("openid", openid);
                  result.set("password", openid);
                  result.set("userData", res.userInfo);

                  
                  result.save().then(function(){
                    console.log("保存成功。");
                    that.setData({ phoneNumber: pn, realName: rn, inputInfo: false });
                    getApp().globalData.phoneNumber = pn;
                    getApp().globalData.realName = rn;
                    wx.setStorageSync("realName", rn);
                    wx.setStorageSync("phoneNumber", pn);

                  }, function(err){
                    console.log("保存失败", err);
                    wx.showModal({
                      title: '出错了',
                      content: err.message,
                      showCancel: false,
                    });

                  });
                },
                error: function (re, error) {
                  console.log("yc 228 error");
                }
              })

            }
          })
        }else{
          console.log("拒绝授权。");
          wx.showModal({
            title: '提示',
            content: "请允许获取授权。",
            showCancel: false,
          });

        }
      }
    })
  },

//扫码成功提示音
 playDi: function(){
   wx.playVoice({
     filePath: '../../../video/di.wav',
   })

 },

  scanYcCode : function(){
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ["qrCode"],
      success: function(res) {
          //that.playDi();
        console.log("scan sucess", res);

        wx.playVoice({
          filePath: '../../../video/di.wav',
          complete: function(){
            var ctCode = res.result;
            var ctCode = that.decodeQrCode(ctCode);
            var ctName = ctList[ctCode];
            if (!ctName) {
              wx.showModal({
                title: '提示',
                content: '非法二维码。',
                showCancel: false,
              });
              return;

            }
            that.addYcRecord(ctCode, ctName);
            common.showTip("扫码成功请用餐", "请用餐");
          }
        })
      },
      fail: function(res) {},
      complete: function(res) {
        console.log("scan complete", res);
      },
    })
  },

  //根据餐厅代码获取餐厅名字
  getCtName : function(ctCode){
    return "总行餐厅";
  },

//根据扫码确定所属餐厅
  setBelongCt: function(actCode, actName){
    var lastCtCode = wx.getStorageSync("ctCode");
    var lastCtName = wx.getStorageSync("ctName");
    if (actCode != lastCtCode){
      wx.setStorageSync("ctCode", actCode);
    }

    if (actName != lastCtName){
      wx.setStorageSync("ctName", actName);
    }
    this.setData(
      { ctCode: actCode, ctName: actName}
    )

  },

  //扫码成功后增加用餐记录
  addYcRecord:function(ctCode, ctName){
    var that = this;
    var user = Bmob.User.current();
    var YcRecord = Bmob.Object.extend("YcRecord");
    var record  = new YcRecord();
    var realName = getApp().globalData.realName;
    var phoneNumber = getApp().globalData.phoneNumber;
    //var ctName = this.getCtName(ctCode);
    var openid = user.attributes.authData.weapp.openid;

    let time = new Date//当前日期
    var hour = time.getHours();
    var ycType = LUNCH;
    if(hour < 10){
      ycType = BREAKFAST;
    }else if(hour < 16){
      ycType = LUNCH;
    }else{
      ycType = SUPPER;
    }

    record.set("userId", user.id);
    record.set("ctCode", ctCode);
    record.set("ctName", ctName);
    record.set("realName", realName);
    record.set("phoneNumber", phoneNumber);
    record.set("openid", openid);
    record.set("ycType", ycType);
    console.log("scan result=", record);

    record.save(null, {
      success : function(result){
        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
        console.log("用餐记录成功, objectId:" + result.id);
        that.setBelongCt(ctCode, ctName);
        that.updateTodayRecord();
      },
      error : function(result, error){
        // 添加失败
        console.log('创建用餐记录失败');
      }
    });


  },

  onPullDownRefresh:function(event){
    this.onShow();
  }
 
})