const express = require('express')
const router = express.Router()
const UserModel = require('../model/UserModel')
const GroupModel = require('../model/GroupModel')

// 搜索好友和群接口
router.post('/search', async (req, res) => {
    let keyword = req.query.keyword
    if (keyword == '') {
        return res.json({
            status: 400,
            msg: '暂无数据',
        })
    }
    try {
        let friends = await UserModel.find({ nick: { $regex: keyword } }, { nick: 1, imgUrl: 1, sign: 1 })
        let groups = await GroupModel.find({ groupName: { $regex: keyword } }, { groupName: 1, imgUrl: 1 })
        if (!friends && !groups) {
            res.json({
                status: 400,
                msg: '暂无数据',
            })
        }
        res.json({
            status: 200,
            data: {
                friendList: friends,
                groupList: groups
            }
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '暂无数据',
        })
    }
})
module.exports = router