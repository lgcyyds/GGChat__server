const express = require('express')
const { AddFriend } = require('../middleware/Validate')
const { validationResult } = require('express-validator')
const FriendModel = require('../model/FriendModel')
const mongoose = require('mongoose')
const router = express.Router()

//发送好友申请
router.post('/friend/add', AddFriend, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 405,
            msg: '参数错误',
            data: errors.array()
        })
    }
    const { userId, friendId } = req.body
    try {
        await FriendModel.create(
            [
                { userId, friendId, state: 0 },//我对好友显示申请中
                { userId: friendId, friendId: userId, state: 4 }//好友对我显示是否同意
            ])
        res.json({
            status: 200,
            msg: '申请中'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '申请失败，请重试'
        })
    }

})

//联系人页面的好友数据（只展示已为好友：state：1）
router.get('/contacts/friend', async (req, res) => {
    const userId = req.query.userId
    const user_Id = new mongoose.Types.ObjectId(userId.toString())
    try {
        const friendList = await FriendModel.find({ userId: userId, state: 1 }).populate('friendId', ['nick', 'sign', 'imgUrl'])
        
        res.json({
            status: 200,
            data: friendList
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '请求失败'
        })

    }

})

//删除好友
router.get('/del/friend', async (req, res) => {
    const { userId, friendId } = req.query
    try {
        await FriendModel.deleteOne({ userId, friendId })
        await FriendModel.deleteOne({ friendId: userId, userId: friendId })
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

//获取到未通过好友申请的列表
router.get('/get/friend/noagree', async (req, res) => {
    const { userId } = req.query
    try {
        const friendApply = await FriendModel.find({ userId, state: 4 }).sort({ _id: -1 }).populate('friendId', ['nick', 'sign', 'imgUrl'])
        res.json({
            status: 200,
            data: friendApply
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//同意好友申请
router.post('/friend/agree', AddFriend, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 405,
            msg: '参数错误'
        })
    }
    const { userId, friendId } = req.query
    try {
        await FriendModel.updateOne({ userId, friendId }, { state: 1 })
        await FriendModel.updateOne({ userId: friendId, friendId: userId }, { state: 1 })
        res.json({
            status: 200,
            msg: '添加成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '添加失败'
        })
    }
})

module.exports = router