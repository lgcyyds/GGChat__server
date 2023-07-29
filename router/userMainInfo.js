const express = require('express')
const router = express.Router()
const { UpdateInfo } = require('../middleware/Validate')
const multerUpload = require('../middleware/multerUpload')
const { validationResult } = require('express-validator')
const utils = require('../utils/index')
const UserModel = require('../model/UserModel')
const FriendModel = require('../model/FriendModel')

// 获取本用户信息
router.get('/user/getUserInfo', async (req, res) => {
    const { token } = req.headers
    try {
        const userInfo = await UserModel.findOne({ token: token }, { _id: 1, phone: 1, nick: 1, imgUrl: 1 })
        res.json({
            status: 200,
            data: userInfo
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '服务器错误'
        })
    }

})


/**
 * userhome主页信息
 */
router.get('/home/user', async (req, res) => {
    // _id:自己的id，_urlId:前端页面点击用户的id
    let { _id, urlId } = req.query    
    try {
        const user = await UserModel.findOne({ _id: urlId }, { token: 0, password: 0 })
        const friendState = await FriendModel.findOne({ userId: _id, friendId: urlId }, { state: 1 })
        if (_id == urlId) {
            return res.json({
                status: 200,
                data: {
                    user,
                    friendState: 3/* (当用户为自己时，3表示编辑资料) */
                }
            })
        } else if (!friendState) {
            return res.json({
                status: 200,
                data: {
                    user
                    /* 不用传friendSatte，因为为null时是加好友 */
                }
            })
        }
        res.json({
            status: 200,
            data: {
                user,
                friendState: friendState.state
            }
        })
    } catch (error) {
        return res.json({
            status: 404,
            data: null,
            msg: "加载失败"
        })
    }
})

/**
 * message列表页顶部用户头像和昵称
 */
router.get('/tabbar/message/userinfo', async (req, res) => {
    let { _id } = req.query
    try {
        let info = await UserModel.findOne({ _id }, { nick: 1, imgUrl: 1 })
        res.json({
            status: 200,
            data: info
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '信息获取出错',
            data: null
        })
    }
})
/**
 * 上传图片  post请求
 * 说明：
 * 1、后台安装multer模块，引入fs模块
 * 2、router.js入口文件导入模块
 *      const fs = require('fs')
 *      const multer = require('multer')
 * 3、post请求需要引入urlencoded
 */
router.post('/upload/user_photo/user', multerUpload.single("img"), (req, res) => {
    let file = req.file
    try {
        res.json({
            status: 200,
            msg: '上传成功',
            url: `/${file.filename}`
        })
    } catch (error) {
        console.log(error);

        res.json({
            status: 404,
            msg: '上传失败'
        })
    }
})


/**
 * 更新用户信息接口
 */
router.post('/update/user', UpdateInfo, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            status: 405,
            msg: '参数错误',
            data: errors.array()
        })
    }
    const { _id, nick, sex, birthday, sign, imgUrl } = req.body
    const age = utils.calculateAge(birthday)
    const start = utils.getStart(birthday)
    try {
        await UserModel.updateOne({ _id }, { nick, sex, birthday, sign, imgUrl, age, start })
        res.json({
            status: 200,
            msg: '更新成功',
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '更新失败'
        })
    }
})




module.exports = router