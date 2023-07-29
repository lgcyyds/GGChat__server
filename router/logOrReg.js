const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const { RegisterInfo } = require('../middleware/Validate')

const UserModel = require('../model/UserModel')
// jwt
const jwt = require('jsonwebtoken')
//密钥
const config = require('../secert')
const utils = require('../utils/index')
// 登陆注册接口

//登录接口
router.post('/login', async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        const user = await UserModel.findOne({ phone });

        if (!user) {
            return res.json({
                status: 400,
                msg: '账号不存在',
            });
        }

        if (user.password != password) {
            return res.json({
                status: 401,
                msg: '密码错误',
            });
        }

        const token = jwt.sign({ phone }, config.jwtSecret, { expiresIn: '1m' });

        user.token = token;
        await user.save();

        res.json({
            status: 200,
            msg: '登录成功',
            data: {
                token: user.token,
                nick: user.nick,
                _id: user._id,
                imgUrl: user.imgUrl,
            },
        });
    } catch (err) {
        console.error('登录失败:', err);
        res.json({
            status: 404,
            msg: '登录失败',
            data: err,
        });
    }
});

//注册接口
router.post('/register', RegisterInfo, async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.json({
            status: 405,
            msg: '参数错误！',
            data: error.array()
        })
    }
    let { phone, password, nick, sex, birthday, sign } = req.body
    //获取GG号
    let GGCode = 'GG_' + phone
    //计算年龄
    let age = utils.calculateAge(birthday)
    //计算星座
    let star = utils.getStart(birthday)
    try {
        //在数据库中查找用户
        const user = await UserModel.findOne({ phone })
        if (user) {
            return res.json({
                status: 400,
                msg: '该用户已注册'
            })
        }
        const token = jwt.sign({ phone }, config.jwtSecret, { expiresIn: '1m' });
        await UserModel.create({
            phone, // 手机号
            GGCode: GGCode, // WaiF号
            password, // 密码
            nick, // 昵称
            imgUrl: sex === '男' ? '/user_pic1.jpeg' : '/user_pic2.jpeg', // 头像
            sex, // 性别 
            age, // 年龄
            birthday, // 生日
            start: star, // 星座
            sign, // 个性签名
            token
        })
        res.json({
            status: 200,
            msg: '注册成功'
        })
    } catch (error) {
        res.json({
            status: 404,
            msg: '注册失败'
        })
    }

})
module.exports = router