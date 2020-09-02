// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'bxdd-carpool'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let collectionName = event.type == 0 ? 'passengerMsg' : 'driverMsg';

  return await db.collection(collectionName).where({
    '_openid': wxContext.OPENID
  }).get()
}