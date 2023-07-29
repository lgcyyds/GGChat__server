const express = require('express')
const uploadSpace = require('../middleware/multerUpload')
const { addSpace } = require('../middleware/Validate')
const { validationResult } = require('express-validator')
const utils = require('../utils')
const SpaceModel = require('../model/SpaceModel')
const FriendModel = require('../model/FriendModel')
const router = express.Router()

//多照片上传
router.post('/space/upload/space_photo/photos', uploadSpace.array('photos', 9), async (req, res) => {
    const files = req.files
    let filesRes = []
    files.forEach(i => {
        filesRes.push(`/${i.filename}`)
    })
    if (!filesRes.length == 0) {
        res.json({
            status: 200,
            msg: '上传成功',
            url: filesRes
        })
    } else {
        return res.json({
            status: 404,
            msg: '上传失败'
        })
    }
})


//单照片上传
router.post('/space/upload/space_photo/photo', uploadSpace.single('photo'), async (req, res) => {
    const file = req.file
    res.json({
        status: 200,
        name: file.originalname,
        url: `/${file.filename}`
    })
})


//空间动态上传
router.post('/space/add', addSpace, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 405,
            msg: '参数错误'
        })
    }
    const { userId, textDesc, photos } = req.body
    try {
        await SpaceModel.create({ userId, textDesc, photos, time: utils.getNowSpecTime() })
        res.json({
            status: 200,
            msg: '发布成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '发布失败'
        })
    }
})

//获取空间动态列表（自己和全部好友）
router.get('/space/get', async (req, res) => {
    const { userId } = req.query
    try {
        const friendIds = await FriendModel.find({ userId, state: 1 }, { friendId: 1 })
        const friendId = friendIds.map(item => item.friendId)
        const spaceList = await SpaceModel
            .find({ $or: [{ userId }, { userId: { $in: friendId } }] }).sort({ _id: -1 })
            .populate('userId', ["_id", "nick", "imgUrl"])
        res.json({
            status: 200,
            data: spaceList
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

//删除动态接口
router.get('/space/del', async (req, res) => {
    const { _id } = req.query
    try {
        await SpaceModel.deleteOne({ _id })
        res.json({
            status: 200,
            msg: '删除动态成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '删除动态失败'
        })
    }
})

//用户空间详细接口
router.get('/space/details', async (req, res) => {
    const { userId } = req.query    
    try {
        const spaceList = await SpaceModel.find({ userId }).sort({ _id: -1 }).populate('userId', ['nick', 'imgUrl', 'GGCode','phone'])
        res.json({
            status: 200,
            data: spaceList
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }
})

module.exports = router