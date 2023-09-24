const express = require('express')
const PrivateChatModel = require('../model/PrivateChatModel')
const GroupChatModel = require('../model/GroupChatModel')
const FriendModel = require("../model/FriendModel")
const GroupUserModel = require("../model/GroupUserModel")
const GroupModel = require("../model/GroupModel")
const UserModel = require('../model/UserModel')
const photoUpload = require('../middleware/multerUpload')
const mongoose = require('mongoose')
const router = express.Router()

//获取当前聊天好友的信息
router.get('/message/friend', async (req, res) => {
    const { userId, friendId, pageNum } = req.query
    const pageSize = 15
    try {
        const messageList = await PrivateChatModel
            .find({ $or: [{ userId, friendId }, { userId: friendId, friendId: userId }] })
            .populate('userId', ['nick', 'imgUrl'])
            .populate('friendId', ['nick', 'imgUrl'])
            .sort({ _id: -1 })
            .limit(pageSize).skip((pageNum - 1) * pageSize)
        const friendNick = await UserModel.findOne({ _id: friendId }, { nick: 1 })
        const isFriend = await FriendModel.findOne({ userId, friendId, state: 1 })
        if (isFriend !== null) {
            //是好友
            if (messageList.length == 0) {
                return res.json({
                    status: 201,
                    data: {
                        friendNick
                    }
                })
            } else {
                return res.json({
                    status: 200,
                    data: {
                        messageList: messageList.reverse(),
                        friendNick
                    }
                })
            }

        } else {
            res.json({
                status: 202,
                msg: '对方不是你的好友'
            })
        }
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//获取当前聊天群聊的信息
router.get('/message/group', async (req, res) => {
    const { userId, groupId, pageNum } = req.query
    const pageSize = 15
    try {
        const messageList = await GroupChatModel
            .find({ groupId })
            .populate('userId', ['nick', 'imgUrl'])
            .sort({ _id: -1 })
            .limit(pageSize).skip((pageNum - 1) * pageSize)
        const isGroupMember = await GroupUserModel.find({ groupId, userId, state: 1 })
        let groupNick = await GroupModel.findOne({ _id: groupId }, { groupName: 1 })
        if (isGroupMember !== null) {
            //是群成员
            res.json({
                status: 200,
                data: {
                    messageList: messageList.reverse(),
                    groupNick
                }
            })
        } else {
            //不是群成员
            res.json({
                status: 202,
                msg: '你未加入该群聊',
                data: groupNick
            })
        }
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器出错'
        })
    }
})

//私聊多照片上传
router.post('/chat/private/private_photo/photos', photoUpload.array('imgs', 9), async (req, res) => {
    const files = req.files
    let filesRes = []
    files.forEach(i => {
        filesRes.push(`/${i.filename}`)
    });
    if (files.length !== 0) {
        res.json({
            status: 200,
            url: filesRes
        })
    } else {
        res.json({
            status: 500,
            msg: '服务器出错'
        })
    }
})

//私聊单照片上传
router.post('/chat/private/private_photo/photo', photoUpload.single('img'), async (req, res) => {
    const file = req.file
    res.json({
        status: 200,
        name: file.originalname,
        url: `/${file.filename}`
    })
})



//群聊多照片上传
router.post('/chat/group_photo/photos', photoUpload.array('imgs', 9), async (req, res) => {
    const files = req.files
    let filesRes = []
    files.forEach(i => {
        filesRes.push(`/${i.filename}`)
    });
    if (files.length !== 0) {
        res.json({
            status: 200,
            url: filesRes
        })
    } else {
        res.json({
            status: 500,
            msg: '服务器出错'
        })
    }
})

//群聊单照片上传
router.post('/chat/group_photo/photo', photoUpload.single('img'), async (req, res) => {
    const file = req.file
    res.json({
        status: 200,
        name: file.originalname,
        url: `/${file.filename}`
    })
})

//获取tabbar消息页的消息列表（发送过消息的好友/群）
router.get('/message/list', async (req, res) => {
    const { userId } = req.query
    const user_Id = new mongoose.Types.ObjectId(userId?.toString())
    try {
        //查询每一个互发过消息的好友信息和最后一条数据和未读消息数(删除后还是查得到)
        const friendIds = await PrivateChatModel.aggregate([
            { $match: { $or: [{ userId: user_Id }, { friendId: user_Id }] } },
            // { $match: { userId: user_Id } },
            //有可能有多条，所以需要去重
            { $group: { _id: { $cond: [{ $eq: ['$userId', user_Id] }, '$friendId', '$userId'] } } }
        ])
        const friendIdList = friendIds.map(i => i._id)
        //这些发过消息的还是好友吗？(只有是好友才查得到数据)
        const IsfriendIds = await FriendModel.aggregate([
            { $match: { $and: [{ userId: user_Id }, { friendId: { $in: friendIdList } }, { state: 1 }] } },
            { $project: { friendId: 1 } }
        ])
        const IsfriendIdsList = IsfriendIds.map(i => i.friendId)
        const friendAndLastMsg = await UserModel.aggregate
            (
                [
                    { $match: { _id: { $in: IsfriendIdsList } } },
                    // 查询最后一条消息
                    {
                        $lookup: {
                            from: 'private_chats',

                            let: { friendId: '$_id' },
                            pipeline: [
                                //找出他发给我或者我发给他的全部记录
                                { $match: { $expr: { $or: [{ $and: [{ $eq: ['$friendId', '$$friendId'] }, { $eq: ['$userId', user_Id] }] }, { $and: [{ $eq: ['$friendId', user_Id] }, { $eq: ['$userId', '$$friendId'] }] }] } } },
                                { $sort: { _id: -1 } },//按倒序排
                                { $limit: 1 }//倒序拍的第一条就是最后一条消息记录
                            ],
                            as: 'lastMessage'
                        }
                    },
                    // 查询未读消息
                    {
                        $lookup: {
                            from: 'private_chats',
                            let: { friendId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$friendId', user_Id] }, { $eq: ['$userId', '$$friendId'] }, { $eq: ['$state', 0] }]
                                        }
                                    }
                                },
                                {
                                    $group: { _id: { state: '$state' }, count: { $sum: 1 } }
                                },
                                {
                                    $project: { count: 1 }
                                }
                            ],
                            as: 'unreadMsgCount'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            nick: 1,
                            imgUrl: 1,
                            lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                            type: 'friendChat',
                            unreadMsgCount: { $arrayElemAt: ['$unreadMsgCount', 0] }
                            // unreadMsgCount: 1
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            nick: 1,
                            imgUrl: 1,
                            lastMessage: 1,
                            type: 'friendChat',
                            unreadMsgCounts: '$unreadMsgCount.count'
                        }
                    }
                ]
            )

        // 查询群聊的信息和最后一条消息和未读消息数
        let groupIds = await GroupUserModel.distinct('groupId', { userId: userId, state: 1 }).populate('groupId')
        const groupIdList = groupIds.map(i => i._id)
        const groupAndLastMsg = await GroupModel.aggregate([
            { $match: { _id: { $in: groupIdList } } },
            {
                $lookup: {
                    from: 'group_chats',
                    localField: '_id',
                    foreignField: 'groupId',
                    pipeline: [
                        { $sort: { _id: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'lastMessage'
                }
            },
            {
                $project: {
                    _id: 1,
                    groupName: 1,
                    imgUrl: 1,
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                    // lastMsg: 1,
                    type: 'groupChat'
                }
            }
        ])
        //过滤掉没有消息记录的群
        const newGroupAndLastMsg = groupAndLastMsg.filter(item => {
            if (item.hasOwnProperty('lastMessage')) {
                return item
            } else {

            }
        })
        let messageList = [...newGroupAndLastMsg, ...friendAndLastMsg]

        messageList.sort((a, b) => {
            if (a.hasOwnProperty('lastMessage') && b.hasOwnProperty('lastMessage')) {
                return -(new Date(a.lastMessage.time) - new Date(b.lastMessage.time))
            } else if (!a.hasOwnProperty('lastMessage') && !b.hasOwnProperty('lastMessage')) {
                return 0
            } else {
                if (a.hasOwnProperty('lastMessage')) {
                    return -1
                } else {
                    return 1
                }
            }
        })
        res.json({
            status: 200,
            data: messageList
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//将好友的消息设置为已读（先看有无消息，如果有就已读）
router.get('/message/read', async (req, res) => {
    const { userId, friendId } = req.query
    try {
        await PrivateChatModel.updateMany({ friendId: userId, userId: friendId }, { state: 1 })
        res.json({
            status: 200,
            msg: '已读'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

module.exports = router