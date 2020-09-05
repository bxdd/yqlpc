// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: 'bxdd-carpool'
})

const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log('wxContext:', wxContext)
  if(event.showType == 0){
    return await db.collection('Order').add({
      data: {
        orderId: event._id,
        startAddressInfo: event.startAddressInfo,
        endAddressInfo: event.endAddressInfo,
        driver_openid: event._openid,
        passenger_openid: wxContext.OPENID,
        price: event.price,
        flag_pay: 0,
        start: event.start,
        end: event.end,
        date:event.date,
        time: event.time
      }
    })
  }
  else{
    return await db.collection('Order').add({
      data: {
        orderId: event._id,
        startAddressInfo: event.startAddressInfo,
        endAddressInfo: event.endAddressInfo,
        driver_openid: wxContext.OPENID,
        passenger_openid: event._openid,
        price: event.price,
        flag_pay: 0,
        start: event.start,
        end: event.end,
        date:event.date,
        time: event.time
      }
    })
  }
}