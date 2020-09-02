// miniprogram/pages/courseSearch/courseSearchByLoc.js
var getNowFormatDate = require('../../utils/dateUtil.js')

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

// 实例化API核心类
var demo = new QQMapWX({
  key: 'H6HBZ-T5LCV-CXFPA-UAJJR-UDJTE-5EB3X' // 必填
});

// 获取数据库的引用
const db = wx.cloud.database({
  env: 'bxdd-carpool'
})



Page({

  /**
   * 页面的初始数据
   */
  data: {
    startCity: '',
    endCity: '',
    startDistrict: '',
    endDistrict: '',
    startAddress: {},
    endAddress: {},
    date: '',
    courseSearchList: [],
    showType: 0,
    sortTag: 0,
    locationInfo: 'undefined'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    console.log(options)
    if (JSON.stringify(options) != "{}") {
      let searchObj = JSON.parse(options.searchObj)
      this.setData({
        startAddress: searchObj.startAddress,
        endAddress: searchObj.endAddress,
        date: searchObj.date,
        startCity: searchObj.startAddress.city,
        endCity: searchObj.endAddress.city
      })
      // 自动获取拼车数据
      this.getCourseByDistrict();
    } else {
      this.setData({
        date: getNowFormatDate()
      })  
    }
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        let latitude = res.latitude
        let longitude = res.longitude
        _this.setData({
          myLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得dialog组件
    this.courseCard = this.selectComponent("#courseCard");
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

  },

  /**
   * 日期选择 
   */
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
    this.getCourseByDistrict();
  },
  /**
   * 选择终点
   */
  bindSelectEnd: function (e) {
    this.chooseLocation('end');
  },
  /**
   * 选择起点
   */
  bindSelectStart: function (e) {
    this.chooseLocation('start');
  },
  
  chooseLocation: function (type) {
    let _this = this;
    new Promise(resolve => {
      wx.chooseLocation({
        success: function (res) {
          console.log(res)
          if (type === 'start') {
            _this.setData({        
              startAddress: {
                name: res.name,
                latitude: res.latitude,
                longitude: res.longitude
              }
            })
          } else {
            _this.setData({
              endAddress: {
                name: res.name,
                latitude: res.latitude,
                longitude: res.longitude
              }
            })
          } 
          resolve(res)
        },
        fail: function (res) {
          console.log(res);
        }
      })
    }).then(res => {
      demo.reverseGeocoder({
        location: {
          latitude: res.latitude,
          longitude: res.longitude
        },
        success: function (res2) {
          // 设置state
          if (type === 'start') {
            _this.setData({
              startCity: res2.result.address_component.city,
              startDistrict: res2.result.address_component.district
            })
          } else {
            _this.setData({
              endCity: res2.result.address_component.city,
              endDistrict: res2.result.address_component.district
            })
          } 
          // 判断是否请求数据
          _this.getCourseByDistrict();
        },
      });
    })
  },

  getCourseByDistrict: function () {
    let _this = this;
    console.log(_this.data.date, _this.data.startCity, _this.data.endCity)
    if (_this.data.date === '' || _this.data.startCity === '' || _this.data.endCity === '') {
      return false;
    }
    console.log('请求shuju...')
    // 加载动画
    wx.showLoading({
      title: '加载中...',
    })
    // 调用云函数，更新统计数据
    console.log({
      start: {
        city: _this.data.startCity,
        district: _this.data.startDistrict
      },
      end: {
        city: _this.data.endCity,
        district: _this.data.endDistrict
      },
      date: _this.data.date,
      showType: this.data.showType
    })
    wx.cloud.callFunction({
      name: 'getCourseByDistrict',
      data: {
        start: {
          city: _this.data.startCity,
          district: _this.data.startDistrict
        },
        end: {
          city: _this.data.endCity,
          district: _this.data.endDistrict
        },
        date: _this.data.date,
        showType: this.data.showType
      },
    }).then(res => {
      let courseList = res.result.data;
      console.log('courseList: ', courseList)
      // 计算距离信息
      if (res.result.data.length > 0) {
        let arr = res.result.data;
        let startAddressArr = [];
        let endAddressArr = [];
        for (let i = 0; i < arr.length; i++) {
          startAddressArr.push({
            latitude: arr[i].startAddressInfo.latitude,
            longitude: arr[i].startAddressInfo.longitude
          });
          endAddressArr.push({
            latitude: arr[i].endAddressInfo.latitude,
            longitude: arr[i].endAddressInfo.longitude
          });
        }
        demo.calculateDistance({
          from: this.data.myLocation,
          to: startAddressArr,
          success: function (res) {
            let distanceArr = res.result.elements;
            for (let i = 0; i < distanceArr.length; i++) {
              courseList[i].distance = (distanceArr[i].distance / 1000).toFixed(2);
            }
            _this.setData({
              courseSearchList: courseList.sort(sortByDis)
            })
          }
        });
      } else {
        _this.setData({
          courseSearchList: []
        })
      } 
      setTimeout(function () {
        wx.hideLoading()
      }, 500);
    }).catch(console.error)
  },

  _getDriverCourse: function () {
    this.setData({
      showType: 1
    })
    this.getCourseByDistrict();
  },

  _getPassengerCourse: function () {
    this.setData({
      showType: 0
    })
    this.getCourseByDistrict();
  },
  _bindSetSortTag: function(e){
    console.log('event: ', e)
    this.setData({
      sortTag: e.detail.sortTag
    })
    this.getCourseByDistrict();
  }
})



function sortByDis(a, b) {
  return a.distance - b.distance
}
