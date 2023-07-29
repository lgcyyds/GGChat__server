const mongoose = require('mongoose')

const Schema = mongoose.Schema
//群聊表
const GroupChatType = {
    groupId: { type: Schema.Types.ObjectId, ref: 'group' },//群is
    userId: { type: Schema.Types.ObjectId, ref: 'user' },//用户id
    message: Schema.Types.Mixed,//消息（图片、文字）
    msgType: { type: String },//消息类型（0:文字（包括表情包），2:图片）
    time: { type: String }//发送时间
}

const GroupChatModel = mongoose.model('group_chat', new Schema(GroupChatType))

module.exports = GroupChatModel