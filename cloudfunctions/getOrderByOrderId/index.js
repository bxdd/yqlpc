// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'bxdd-carpool'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.showType == 0){
    let result = await db.collection('Order')
      .where({
        'orderId': event.orderId,
        'driver_openid': wxContext.OPENID,
      }).get()
      return result;
  }
  else{
    let result = await db.collection('Order')
    .where({
      'orderId': event.orderId,
      'passenger_openid': wxContext.OPENID,
    }).get()
    return result;
  }
}