const mongoose = require('mongoose')

const Schema = mongoose.Schema
//用户表
const UserType = {
    phone: String,//手机号
    GGCode: String,//GG号
    password: String,//密码
    nick: String,//昵称
    imgUrl: String,//头像链接
    sex: String,//性别
    age: Number,//年龄
    birthday: String,//生日
    start: String,//星座
    sign: String,//个性签名
    token: String//用户身份
}

const UserModel = mongoose.model('user', new Schema(UserType))

module.exports = UserModel