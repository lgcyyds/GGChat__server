const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json());//用于解析JSON格式的请求体的中间件
// app.use(express.urlencoded({extended:true}))
const logOrReg = require('./router/logOrReg')
const userMainInfo = require('./router/userMainInfo')
const searchFriendOrGroup = require('./router/searchFriendOrGroup')
const Friend = require('./router/Friend')
const Group = require('./router/Group')
const space = require('./router/space')
const chat = require('./router/chat')
app.use(cors())
app.use('/', chat)
app.use('/', space)
app.use('/', Group)
app.use('/', Friend)
app.use('/', searchFriendOrGroup)
app.use('/', logOrReg)
app.use('/', userMainInfo)

// 静态资源共享
app.use(express.static('upload/private_photo'))
app.use(express.static('upload/group_photo'))
app.use(express.static('upload/space_photo'))
app.use(express.static('upload/user_photo'))
app.use(express.static('upload/group_chat'))
app.use(express.static('public/img'))
module.exports = app