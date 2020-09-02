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
    return await db.collection('Order').where({
      orderId: event.orderId,
      passenger_openid: wxContext.OPENID
    }).update({
      data: {
        flag_pay: 1
      }
    })
  }
  else{
    return await db.collection('Order').where({
      orderId: event.orderId,
      driver_openid: wxContext.OPENID
    }).update({
      data: {
        flag_pay: 1
      }
    })
  }
}