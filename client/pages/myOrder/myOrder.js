
// 获取数据库的引用
const db = wx.cloud.database({
  env: 'bxdd-carpool'
})


Page({

  /**
   * 页面的初始数据
   */
  data: {
    showType: 0,
    msgList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('用户信息：',res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    this.bindGetAllOrder();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.bindGetAllOrder();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 日期选择 
   */
  _setPassengerCourse: function(e){
    this.setData({
      showType: 0
    })
    this.bindGetAllOrder();
  },
  _setDriverCourse: function(e){
    this.setData({
      showType: 1
    })
    this.bindGetAllOrder();
  },
  bindGetAllOrder: function () {
    this.setData({
      msgList: []
    })
    let _this = this;
    
    wx.cloud.callFunction({
      name: 'getUserOrder',
      data: {
        showType: this.data.showType,
      },
    }).then(res => {
      let courseList = res.result.data;
      console.log('courseList: ', courseList)
      // 计算距离信息
      if (res.result.data.length > 0) {
        _this.setData({
          msgList: courseList
        })
      }   
      wx.hideLoading()
    }).catch(console.error)
  },
  _bindOrderPay: function(e){
    console.log('e: ', e)
    let _this = this;
    wx.cloud.callFunction({
      name: 'payOrderById',
      data: {
        orderId: e.detail.orderId,
        showType: _this.data.showType
      },
    }).then(res => {
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 1000
      })
      this.bindGetAllOrder()
    })
  }
})