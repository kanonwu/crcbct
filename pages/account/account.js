var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app = getApp()
Page({
    data: {
        realName: null,
        phoneNuber: null
    },
    onShow: function () {
      //更新数据
      this.setData({
        realName: getApp().globalData.realName,
        phoneNumber: getApp().globalData.phoneNumber
      })

    },
    
    about: function (e) {
         common.showModal('本程序由岑溪农商行信息科技部开发，有任何意见和建议请与信息科技部联系（8236608）。');
    },



})