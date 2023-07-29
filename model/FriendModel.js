const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FriendType = {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },//用户id
    friendId: { type: Schema.Types.ObjectId, ref: 'user' },//好友id
    state: { type: Number }
    //0-申请中、1-已为好友、2-未加好友、3-用来判断是否是自己主页、4申请方（接收方）
}

const FriendModel = mongoose.model('friend', new Schema(FriendType))

module.exports = FriendModel