var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var app = getApp()
Page({
    data: {
        userInfo: {},
        realName: null,
        phoneNumber: null,
    },
    onShow: function () {
        var that = this;
        //更新数据
        that.setData({
          userInfo: getApp().globalData.userInfo,
          realName: wx.getStorageSync("realName"),
          phoneNumber: wx.getStorageSync("phoneNumber"),
        })

        //调用应用实例的方法获取全局数据
        // app.getUserInfo(function (userInfo) {
        //     console.log(userInfo)
        //     //更新数据
        //     that.setData({
        //         userInfo: userInfo,
        //         realName : wx.getStorageInfoSync("realName"),
        //         phoneNumber : wx.getStorageInfoSync("phoneNumber"),
        //     })
        // })

    },
    addFeedback: function (event) {
        var that = this;
        var content = event.detail.value.content;
      
        if (!content) {
            common.showTip("内容不能为空", "loading");
            return false;
        }
        else {
            that.setData({
                loading: true
            })
            var user = Bmob.User.current();
            //增加反馈意见
            var FeedBack = Bmob.Object.extend("feedback");
            var feedback = new FeedBack();
            feedback.set("content", content);
            feedback.set("userId", user.id);
            feedback.set("realName", getApp().globalData.realName);
            feedback.set("phoneNumber", getApp().globalData.phoneNumber);
  
            //添加数据，第一个入口参数是null
            feedback.save(null, {
                success: function (result) {
                    // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                    common.showModal('提交建议成功，谢谢支持。','提示',function(){
                        wx.navigateBack();
                    });
                   
                    // wx.navigateBack();
                    that.setData({
                        loading: false
                    })

                },
                error: function (result, error) {
                    // 添加失败
                    common.showModal('保存失败，请重新提交');

                }
            });
        }

    },

})