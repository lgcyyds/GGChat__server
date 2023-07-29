const mongoose = require('mongoose')

const Schema = mongoose.Schema
//私聊表
const PrivateChatType = {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },//用户id
    friendId: { type: Schema.Types.ObjectId, ref: 'user' },//好友id
    message: Schema.Types.Mixed,//消息内容（文字、图片）
    msgType: { type: String },//消息类型（0-文字、1-图片）
    time: { type: String },//发送时间
    state: { type: Number, default: 0 }//（0-未读、1-已读）
}

const PrivateChatModel = mongoose.model('private_chat', new Schema(PrivateChatType))

module.exports = PrivateChatModel