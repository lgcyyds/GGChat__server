const express = require('express')
const { GroupInfo } = require('../middleware/Validate')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose');
const GroupModel = require('../model/GroupModel')
const GroupUserModel = require('../model/GroupUserModel')
const utils = require('../utils')
const { UpdateGroupInfo } = require('../middleware/Validate')
const uploadGroup = require('../middleware/multerUpload')
const { json } = require('stream/consumers')
const router = express.Router()

//新建群聊接口
//imgUrl: 前端已经把地址写好，只用存数据库就行，群头像图片上传接口只用把头像存入 /upload/group 中就行
router.post('/create/group', GroupInfo, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.json({
            status: 405,
            msg: '参数错误'
        })
    }
    const { userId, groupName, sign, imgUrl } = req.body
    try {
        let group = await GroupModel.create({
            userId,//群主
            groupName,//群昵称
            groupNumber: new Date().getTime() + Math.floor(Math.random(100, 999)),
            sign,
            imgUrl,
            createTime: utils.getNowTime()
        })
        await GroupUserModel.create({ groupId: group._id, userId: userId, state: 1 })
        res.json({
            status: 200,
            msg: '创建成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '创建失败'
        })
    }
})

//群头像上传
router.post('/upload/group/group_photo/groupUpload', uploadGroup.single('img'), async (req, res) => {
    let file = req.file
    res.json({
        status: 200,
        name: file.originalname,
        url: `/${file.filename}`
    })
})

//获取群主页信息
router.get('/home/group', async (req, res) => {
    const { groupId, userId } = req.query
    try {
        let group = await GroupModel.findOne({ _id: groupId })
        let userState = await GroupUserModel.findOne({ groupId, userId }, { state: 1 })

        if (!userState) {
            //未加入            
            return res.json({
                status: 200,
                data: group,
                state: 2
            })
        } else if (userState.state === 1) {
            //已加入
            return res.json({
                status: 200,
                data: group,
                state: 1
            })
        } else {
            //申请中
            return res.json({
                status: 200,
                data: group,
                state: 0
            })
        }
    } catch (error) {
        res.json({
            status: 404,
            data: '服务器错误'
        })
    }
})

//获取群成员信息接口
router.get('/get/groupUser', async (req, res) => {
    const { groupId } = req.query
    try {
        const groupMember = await GroupUserModel.find({ groupId, state: 1 }, { userId: 1 }).populate('userId', ['nick', 'imgUrl'])
        res.json({
            status: 200,
            data: groupMember
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//发起加入群聊申请接口
router.post('/group/add', async (req, res) => {
    const { userId, groupId } = req.query
    try {
        await GroupUserModel.create({ userId, groupId, state: 0 })
        res.json({
            status: 200,
            msg: '申请成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '申请失败'
        })
    }
})

//联系人页面展示群列表（只返回已入群的state：1）
router.get('/contacts/group', async (req, res) => {
    const { userId } = req.query
    try {
        let groupList = await GroupUserModel.find({ userId, state: 1 }, { groupId: 1 }).populate('groupId', ['groupName', 'imgUrl'])
        res.json({
            status: 200,
            data: groupList
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '请求失败'
        })
    }
})

//获取需要修改的群信息 $ne表示排除
router.get('/get/update/group', async (req, res) => {
    const { groupId, groupLeaderId } = req.query
    try {
        let groupInfo = await GroupModel.findOne({ _id: groupId }, { groupName: 1, sign: 1, imgUrl: 1 })
        let groupMemberList = await GroupUserModel.find({ groupId, state: 1 })
            .find({ userId: { $ne: groupLeaderId } })
            .populate('userId', ['nick', 'imgUrl'])
        res.json({
            status: 200,
            data: {
                groupInfo,
                groupMemberList
            }
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//修改群信息
router.post('/update/groupInfo', UpdateGroupInfo, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res, json({
            status: 405,
            mgs: '参数错误'
        })
    }
    const { _id, groupName, sign, imgUrl } = req.query
    try {
        await GroupModel.updateOne({ _id }, { groupName, sign, imgUrl })
        res.json({
            status: 200,
            msg: '更新成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '更新失败'
        })
    }

})

//删除群成员/群成员自愿退出
router.get('/del/groupUser', async (req, res) => {
    const { groupId, userId } = req.query
    try {
        await GroupUserModel.deleteOne({ groupId, userId })
        res.json({
            status: 200,
            msg: '删除成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '删除失败'
        })
    }

})

//群主退出群聊（解散）
router.get('/del/group', async (req, res) => {
    const { groupId } = req.query
    try {
        await GroupModel.deleteOne({ _id: groupId })
        await GroupUserModel.deleteMany({ groupId })
        res.json({
            status: 200,
            msg: '解散成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '解散失败'
        })
    }
})

//获取群申请通知列表
router.get('/get/group/noagree', async (req, res) => {
    const { userId } = req.query
    try {
        const pipeline = [
            {
                $match: {
                    state: 0
                }
            },
            {
                $lookup: {
                    from: 'groups', // 群信息表的集合名
                    localField: 'groupId',
                    foreignField: '_id',
                    as: 'group'
                }
            },
            {
                $match: {
                    'group.userId': new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'users', // 用户表的集合名
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'friendId'
                }
            },
            {
                $unwind: '$friendId'
            },
            {
                $project: {
                    groupId:1,
                    userId:1,
                    group:1,
                    'friendId.nick': 1,
                    'friendId.imgUrl': 1,
                    'friendId._id': 1,
                    'friendId.sign': 1
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ];

        let list = await GroupUserModel.aggregate(pipeline);
        res.json({
            status: 200,
            data: list
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '服务器出错'
        })
    }
})

//同意入群申请接口
router.post('/group/agree', async (req, res) => {
    const { userId, groupId } = req.query
    try {
        await GroupUserModel.updateOne({ userId, groupId }, { state: 1 })
        res.json({
            status: 200,
            msg: '已同意'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '未同意'
        })
    }
})

module.exports = router