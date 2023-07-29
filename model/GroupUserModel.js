const mongoose = require('mongoose')

const Schema = mongoose.Schema
//群和用户的表
const GroupUserType = {
    groupId:{type:Schema.Types.ObjectId, ref:'group'},//群id
    userId:{type:Schema.Types.ObjectId,ref:'user'},//用户id
    state:{type:Number}//状态（0-申请中、1-已经加入该群、2-未加入群）
}

const GroupUserModel = mongoose.model('group_user', new Schema(GroupUserType))

module.exports = GroupUserModel