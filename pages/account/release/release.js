//index.js
//获取应用实例
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js'); 
var app = getApp();


const BREAKFAST = 1; //早餐  10点前
const LUNCH = 2; //早餐  16点前
const SUPPER = 3; //晚餐  16点后

var that;
Page({
  data: {
    loading: false,
    windowHeight: 0,
    windowWidth: 0,
    limit: 10,
    userInfo: 10,
    //今日用记录
    ycRecord: [],
    realName: null,
    phoneNuber: null,
    breakFastCount_1: 0,
    lunchCount_1 : 0,
    supperCount_1 : 0,
    breakFastCount_2: 0,
    lunchCount_2: 0,
    supperCount_2: 0

    

  },


//统计上月和本月的用餐总数
  countYcRecord: function(){
    var that = this;
    let date = new Date//当前日期

    var hour = date.getHours();

    let year = date.getFullYear()//当前年

    let month = date.getMonth() + 1//当前月份
    let day = date.getDate()//当天

    
    //查询用餐 上月 早餐
    var lastMonth = month - 1;
    var lastYear = year;
    if(month == 1){
      lastMonth = 12,
      lastYear = year - 1;
    }

    //上月1日    
    var strDate = util.formatDay2(lastYear, lastMonth, 1, "-");
    var YcRecord = Bmob.Object.extend("YcRecord");
    //本月1日
    var strMonthFristDay = util.formatDay2(year, month, 1, "-");
    //本月最后一日
    var myDate = new Date(year,month, 0);
    console.log("最后一天", myDate.getDate());
    var strMonthLastDay = util.formatDay2(year, month, myDate.getDate(), "-");

    console.log(strMonthFristDay);

    var user = Bmob.User.current();
    var openid = user.attributes.authData.weapp.openid;

    //上月早餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strDate + " 00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthFristDay + " 00:00:00" } } }]);
    queryRecord.equalTo("ycType", BREAKFAST);
    queryRecord.equalTo("openid", openid);
    queryRecord.count({
      success: function (count) {
        console.log("上月早餐", count);
        that.setData({
          breakFastCount_1: count
        })
      },
      error:function(error){
        console.log(error);
      }
    })

    //上月午餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strDate + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthFristDay + " 00:00:00" } } }]);
    queryRecord.equalTo("ycType", LUNCH);
    queryRecord.equalTo("openid", openid);
    queryRecord.equalTo("")
    queryRecord.count({
      success: function (count) {
        that.setData({
          lunchCount_1: count
        })
      }
    })

    //上月晚餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strDate + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthFristDay + " 00:00:00" } } }]);
    queryRecord.equalTo("ycType", SUPPER);
    queryRecord.equalTo("openid", openid);
    queryRecord.count({
      success: function (count) {
        that.setData({
          supperCount_1: count
        })
      }
    })

    //本月早餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strMonthFristDay + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthLastDay + " 23:59:00" } } }]);
    queryRecord.equalTo("ycType", BREAKFAST);
    queryRecord.equalTo("openid", openid);
    queryRecord.count({
      success: function (count) {
        that.setData({
          breakFastCount_2: count
        })
      }
    })

    //上月午餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strMonthFristDay + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthLastDay + " 23:59:00" } } }]);
    queryRecord.equalTo("ycType", LUNCH);
    queryRecord.equalTo("openid", openid);
    queryRecord.count({
      success: function (count) {
        that.setData({
          lunchCount_2: count
        })
      }
    })

    //上月晚餐 
    var queryRecord = new Bmob.Query(YcRecord);
    queryRecord.equalTo("$and", [{ "createdAt": { "$gte": { "__type": "Date", "iso": strMonthFristDay + "  00:00:00" } } }, { "createdAt": { "$lte": { "__type": "Date", "iso": strMonthLastDay + " 23:59:00" } } }]);
    queryRecord.equalTo("ycType", SUPPER);
    queryRecord.equalTo("openid", openid);
    queryRecord.count({
      success: function (count) {
        that.setData({
          supperCount_2: count
        })
      }
    })

  },

  //查询用餐记录 {序号，姓名，时间，餐厅}
  queryYcRecord: function () {
    var that = this;
    var td = new Array();
    //var user = Bmob.User.current();
    //var openid = user.attributes.authData.weapp.openid;
    var openid = wx.getStorageSync('openid')
    console.log("openid=", openid);
    var YcRecord = Bmob.Object.extend("YcRecord");
    //var record = new YcRecord();
    var query = new Bmob.Query(YcRecord);
    // query.descending("updatedAt");
    query.equalTo("openid", openid);
    query.descending("createdAt");
    
    
    
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        that.setData({ ycRecord: results });
        // 循环处理查询到的数据

      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },

  onLoad: function () {

    that = this
    that.setData({
      realName: getApp().globalData.realName,
      phoneNumber: getApp().globalData.phoneNumber

    })

  },

  onShow: function () {
    this.queryYcRecord();
    this.countYcRecord();

  },
  pullUpLoad: function (e) {
    // var limit = that.data.limit + 2
    // this.setData({
    //   limit: limit
    // })
     this.onShow()
  },


})
