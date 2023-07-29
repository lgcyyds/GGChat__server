const mongoose = require('mongoose')

const Schema = mongoose.Schema
//动态表
const SpaceType = {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },//用户id
    textDesc: { type: String, default: null },//文字描述
    photos:{type:Array, default:[]},//图片列表
    time: String//发布时间
}

const SpaceModel = mongoose.model('space', new Schema(SpaceType))

module.exports = SpaceModel