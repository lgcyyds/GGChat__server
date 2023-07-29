const mongoose = require('mongoose')

const Schema = mongoose.Schema
//群信息表
const GroupType = {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },//群主id
    groupName: { type: String },//群名称
    groupNumber: { type: Number },//群号
    sign: { type: String },//群简介
    imgUrl: { type: String , default:'/group_pic.png'},//群头像
    createTime: { type: String }//创建时间
}

const GroupModel = mongoose.model('group', new Schema(GroupType))

module.exports = GroupModel