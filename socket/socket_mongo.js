// 用户表
const UserModel = require('../model/UserModel')
// 好友表
const FriendModel = require('../model/FriendModel')
// 私聊表
const PrivateChatModel = require('../model/PrivateChatModel')
// 群（信息）表
const GroupModel = require('../model/GroupModel')
// 群消息表
const GroupChatModel = require('../model/GroupChatModel')
const mongoose = require('mongoose')
//联系人页面消息数量(好友申请数)
const friendNoticeNum = (userId) => {
    return FriendModel.find({ userId, state: 4 }).count()
}

//联系人页面消息数量(入群申请数)
const groupNoticeNum = (userId) => {
    const user_Id = new mongoose.Types.ObjectId(userId.toString())
    return GroupModel.aggregate([
        { $match: { userId: user_Id } },
        {
            $lookup: {
                from: 'group_users',
                localField: '_id',
                foreignField: 'groupId',
                pipeline: [
                    { $match: { $expr: { $and: [{ $ne: ['$userId', user_Id] }, { $eq: ['$state', 0] }] } } },
                    {
                        $project: {
                            userId: 1,
                            state: 1
                        }
                    }
                ],
                as: 'groupMember'
            }
        },
        { $unwind: '$groupMember' },
        {
            $group: {
                _id: null,
                totalNum: { $sum: 1 },

            }
        }
    ])
}

//保存一对一聊天记录
const savePrivateChatMsg = async (obj) => {
    /**
        * @文字消息
        * {
        *      userId: {
        *          _id: '645551f3567271fb5c48f8e7',
        *          nick: '修改后的admin',
        *          imgUrl: '/1683769367445-1683769127866-IMG_4838.jpeg'
        *      },
        *      msgType: 0,
        *      message: 'asd',
        *      time: '刚刚'
        *  }
        *  @单图片
        * {
        *      userId: {
        *          _id: '645551f3567271fb5c48f8e7',
        *          nick: '修改后的admin',
        *          imgUrl: '/1683769367445-1683769127866-IMG_4838.jpeg'
        *      },
        *      msgType: 1,
        *      message: '/1685328318563-1371682483780_.pic.png',
        *      time: '刚刚'  // 这只是前端传来的时间，时间需要后端生产
        *  }
        * @多图片
        * {
        *      userId: {
        *          _id: '645551f3567271fb5c48f8e7',
        *          nick: '修改后的admin',
        *          imgUrl: '/1683769367445-1683769127866-IMG_4838.jpeg'
        *      },
        *      msgType: 1,
        *      message: [ '/1685328703405-test.jpeg', '/1685328703425-test2.jpeg' ],
        *      time: '刚刚'
        *  }
        */
    const { uId, fId, dataMsg } = obj
    if (dataMsg.msgType === 0) {
        let privateMsg = await PrivateChatModel.create({
            userId: uId,
            friendId: fId,
            message: dataMsg.message,
            msgType: dataMsg.msgType,
            time: new Date(),
        })
        return privateMsg
    } else {
        let privateMsg
        //多图片
        if (dataMsg.message instanceof Array && dataMsg.message.length > 0) {
            for (msg of dataMsg.message) {
                privateMsg = await PrivateChatModel.create({
                    userId: uId,
                    friendId: fId,
                    message: msg,
                    msgType: dataMsg.msgType,
                    time: new Date(),
                })
            }
        } else {
            //单图片
            privateMsg = await PrivateChatModel.create({
                userId: uId,
                friendId: fId,
                message: dataMsg.message,
                msgType: dataMsg.msgType,
                time: new Date(),
            })
        }
        return privateMsg
    }


}


//保存群聊聊天记录
const saveGroupChatMsg = async(obj) => {
    const { uId, gId, dataMsg } = obj
    if (dataMsg.msgType === 0) {
        let groupMsg = await GroupChatModel.create({
            userId: uId,
            groupId: gId,
            message: dataMsg.message,
            msgType: dataMsg.msgType,
            time: new Date(),
        })
        return groupMsg
    } else {
        let groupMsg
        //多图片
        if (dataMsg.message instanceof Array && dataMsg.message.length > 0) {
            for (msg of dataMsg.message) {
                groupMsg = await GroupChatModel.create({
                    userId: uId,
                    groupId: gId,
                    message: msg,
                    msgType: dataMsg.msgType,
                    time: new Date(),
                })
            }
        } else {
            //单图片
            groupMsg = await GroupChatModel.create({
                userId: uId,
                groupId: gId,
                message: dataMsg.message,
                msgType: dataMsg.msgType,
                time: new Date(),
            })
        }
        return groupMsg
    }


}

module.exports = {
    friendNoticeNum,
    groupNoticeNum,
    savePrivateChatMsg,
    saveGroupChatMsg
}