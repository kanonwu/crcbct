// pages/yc/calendar.js
var Bmob = require('../../../utils/bmob.js');

const   BREAKFAST = 1; //早餐
const LUNCH = 2; //早餐

Page({

   /**
   * 页面的初始数据
   */
  data: {
    dates:[],
    weeks:[],
    pagetype:'year',
    orderData: [],
    ycType : LUNCH
  },

  //检查指定日期是否已订餐
  isSelect: function (year, month, day) {

    var ods = this.data.orderData;
    //console.log("bbbbbbbb", ods);
    for (var i = 0; i < ods.length; i++) {
      var order = {
        "year": ods[i].get("year"),
        "month": ods[i].get("month"),
        "day": ods[i].get("day"),
        "orderType": ods[i].get("orderType")
      };
      if (order.year == year && order.month == month && order.day == day && order.orderType == this.data.ycType) {
        return 1;
      }
    }
    return 0;
  },

//查询报餐数据，当前2个月的
  getOrderData: function( ){
    console.log("getOrderData");
    var that = this;
    var user = Bmob.User.current();
    var openid = user.attributes.authData.weapp.openid;
    var YcOrder = Bmob.Object.extend("YcOrder");
    var order = new YcOrder();

    let date = new Date//当前日期
    let year = date.getFullYear()//当前年

    let month = date.getMonth() + 1//当前月份
    let day = date.getDate()//当天
    var orderType = that.data.ycType;

    var query1 = new Bmob.Query(YcOrder);
    query1.equalTo("openid", openid);
    query1.equalTo("month", month);
    query1.equalTo("orderType", orderType)
    var query2 = new Bmob.Query(YcOrder);
    query2.equalTo("openid", openid);
    query2.equalTo("month", month + 1);
    query2.equalTo("orderType", orderType)
    var mainQuery  = Bmob.Query.or(query1, query2);
    
    let orderData = null;
    let orderDataObject = null;
    mainQuery.find({
      success: function(results){
        that.data.orderData = results;
       // console.log("aaaaaaaaaaaaaa", results);
        that.dateData();
        
      },
      error: function(error){
        console.log("finderror", error);
      }
    })

  },
 
 //增加报餐记录
 //year 年  month 月， day日，orderType 1 早餐,2 中餐
 addOrder:function(year, month, day, orderType){
   console.log("addOrder", year, month, day, orderType);
   var user = Bmob.User.current();
   var openid = user.attributes.authData.weapp.openid;
   var YcOrder = Bmob.Object.extend("YcOrder");
   var order = new YcOrder();
   var realName = getApp().globalData.realName;
   var phoneNumber = getApp().globalData.phoneNumber;
   var ctCode = wx.getStorageSync("ctCode");
   var ctName = wx.getStorageSync("ctName");
   if(ctCode == null){
     ctCode = "4000";
     ctName = "总行";
   }
   order.set("ctCode", ctCode);
   order.set("ctName", ctName);
   order.set("userId", user.id);
   order.set("openid", openid);
   order.set("realName", realName);
   order.set("phoneNumber", phoneNumber);
   order.set("year", year);
   order.set("month", month);
   order.set("day", day);
   order.set("orderType", orderType);

   order.save(null, {
     success: function(result){
       //console.log("添加报餐成功。");

     },
     error: function(result, error){
       console.log("报餐失败：", result, error);

     }
   })
 },

 deleteOrder: function (year, month, day, orderType){
   var user = Bmob.User.current();
   var openid = user.attributes.authData.weapp.openid;
   var YcOrder = Bmob.Object.extend("YcOrder");

   var query = new Bmob.Query(YcOrder);
   query.equalTo("openid", openid);
   query.equalTo("year", year);
   query.equalTo("month", month);
   query.equalTo("day", day);
   query.equalTo("orderType", orderType);
   query.first({
     success: function(re){
       //console.log("delete one ", re);
       re.destroy({
         success: function(re){
           console.log("已取消报餐:", re);
         },
         error: function(re, error){
           console.log("取消报餐失败：", re, error);
         }
       })

     },
     error: function(error){
       console.log("查询失败: " + error.code + " " + error.message);
     }
   })

 },
 

  dateData: function () {
    let that = this;
    let dataAll = []//总日历数据
    let dataAll2 = []//总日历数据
    let dataMonth = []//月日历数据
    let date = new Date//当前日期
    let year = date.getFullYear()//当前年
    let week = date.getDay();//当天星期几
    let weeks = []
    let month = date.getMonth() + 1//当前月份
    let day = date.getDate()//当天
    let daysCount = 62//一共显示多少天
    let dayscNow = 0//计数器
    let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]//月份列表
    let nowMonthList = []//本年剩余年份

    let orderData = this.data.orderData;//已订餐数据
    let orderType = this.data.ycType;


    //console.log("selOrderData", orderData);

    for (let i = month; i < 13; i++) {
      nowMonthList.push(i)
    }
    let yearList = [year]//年份最大可能  2年
    for (let i = 0; i < daysCount / 365 ; i++) {
      yearList.push(year + i + 1)
    }
    let leapYear = function (Year) {//判断是否闰年 
      if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
        return (true);
      } else { return (false); }
    }
    //console.log("yearList=", yearList);
    for (let i = 0; i < yearList.length; i++) {//遍历年
      let mList
      if (yearList[i] == year) {//判断当前年份
        mList = nowMonthList
      } else {
        mList = monthList
      }
      //console.log("mList=", mList);
      for (let j = 0; j < 2; j++) {//循环月份 mList.length
        dataMonth = []
        let t_days = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        let t_days_thisYear = []
        if (yearList[i] == year) {
          for (let m = 0; m < nowMonthList.length; m++) {
            t_days_thisYear.push(t_days[mList[m] - 1])
          }
          t_days = t_days_thisYear
        } else {
          t_days = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        }
        //console.log("t_datys", t_days[j]);
        for (let k = 0; k < t_days[j]; k++) {//循环每天
          
          let nowData
          daysCount = t_days[j] + t_days[j+1]; //当前月天数+下个月天数
          if (dayscNow < daysCount) {//如果计数器没满
            dayscNow++
            let days = k + 1
            if (days < 10) {
              days = "0" + days
            }
            let m = mList[j];
            if(m < 10){
              m = "0" + m;
            }
            var sel = 0;
            sel = that.isSelect(yearList[i], mList[j], k+1);
            nowData = {
              year: yearList[i],
              month: mList[j],
              day: k + 1,
              date: yearList[i] + "" + m + days,
              selected: sel,
              re: yearList[i] + "-" + m + "-" + days,
            }
            dataMonth.push(nowData)
            if (k == 0) {
              let date = new Date(yearList[i] + "-" + m + "-" + (k + 1))
              //console.log("计算星期：", date);
              let weekss = date.getDay()//获取每个月第一天是周几
              //console.log("计算星期：", date, weekss);
              weeks.push(weekss)
            }
          } else {
            break
          }
        }
        dataAll.push(dataMonth)
      }
    }
    console.log("dataALl", dataAll);
    for (let i = 0; i < dataAll.length; i++) {
      if (dataAll[i].length != 0) {
        dataAll2.push(dataAll[i]);
      }
    }
    console.log("date=", dataAll2);
    console.log("weeks=", weeks);
    this.setData({
      dates: dataAll2,
      weeks: weeks
    })
  },

//日期选择时间，增加或删除订餐记录
  selectday: function(event){
    var realName = wx.getStorageSync('realName');
    //console.log("onShow realName=", realName);
    if (!realName) {
      return;
    }
    //console.log(event);
    var month = event.target.dataset.mindex;
    var day = event.target.dataset.dindex;
    var selDate = this.data.dates[month][day];
    var sel = this.data.dates[month][day].selected;
    
    let date = new Date//当前日期
    let year = date.getFullYear()//当前年
    let week = date.getDay();//当天星期几
    let monthNow = date.getMonth() + 1//当前月份
    let dayNow = date.getDate()//当天

    let orderType = this.data.ycType;

    //console.log("selDate=", selDate);
    if(month == 0){
      //当前日期之前，不响应点击事件
      if(day + 1 < dayNow)
      return;
    }

    selDate.selected = 1 - sel;
    this.setData({
      dates:this.data.dates
    })

    if(selDate.selected == 0){
      this.deleteOrder(year, monthNow + month, day + 1, orderType);
    }else if(selDate.selected == 1){
      this.addOrder(year, monthNow + month, day + 1, orderType);
    }

  },


  //选择用餐类型  早场或者午餐
  selYcType: function (event){
    var selType = parseInt(event.detail.value);
    this.setData({
      ycType:selType
    })
    this.getOrderData();


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log("onLoad");
    //this.getOrderData(true);
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
    this.getOrderData();
    console.log("this.data.orderData", this.data.orderData);
    //this.dateData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})