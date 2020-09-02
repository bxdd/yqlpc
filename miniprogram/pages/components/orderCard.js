// pages/components/courseCard.js
const db = wx.cloud.database({
  env: 'bxdd-carpool'
})

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    courseObj: {
      type: Object,
      title: '行程对象'
    },
    showType: {
      type: Number,
      title: '类型'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },



  /**
   * 组件的方法列表
   */
  methods: {
    onLoading: function (options) {
      console.log(options)
    },
    _bindPay(e){
      console.log('bindPay!!!', e.target.dataset.orderid)
      this.triggerEvent('bindOrderPay', {'orderId': e.target.dataset.orderid}, {})
    }
  }
})
