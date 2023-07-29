const { check, body } = require('express-validator')
const moment = require('moment')
//更新用户信息的参数校验
const UpdateInfo = [
    check('_id', '_id参数不能为空').notEmpty(),
    check('nick', '昵称不能为空').notEmpty(),
    check('nick', '昵称最大不能超过15个字').isLength({ max: 15 }),
    check('sex', '性别不能为空').notEmpty(),
    check('sex').isIn(['男', '女']).withMessage('性别必须为男或女'),
    check('birthday', '日期不能为空').notEmpty(),
    body('birthday').custom(value => {
        const convertedDate = moment(value, 'YYYY-M-D', true)
        if (convertedDate.isValid()) {
            return true
        } else {
            return new Error('请填写正确日期')
        }
    }),
    check('sign', '个性签名不能为空').notEmpty(),
    check('sign', '个性签名最大不能超过50个字').isLength({ max: 50 }),
]
//注册的参数校验
const RegisterInfo = [
    check('phone', '手机号不合法').isLength({ min: 11, max: 11 }),
    check('phone', '手机号不能为空').notEmpty(),
    check('password', '密码不能为空').notEmpty(),
    check('nick', '昵称不能为空').notEmpty(),
    check('nick', '昵称最大不能超过15个字').isLength({ max: 15 }),
    check('sex', '性别不能为空').notEmpty(),
    check('sex').isIn(['男', '女']).withMessage('性别必须为男或女'),
    check('birthday', '日期不能为空').notEmpty(),
    body('birthday').custom(value => {
        const convertDate = moment(value, 'YYYY-M-D', true)
        if (convertDate.isValid()) {
            return true
        } else {
            return new Error('请填写正确的日期')
        }
    }),
    check('sign', '个性签名不能为空').notEmpty(),
    check('sign', '个性签名最大不能超过50个字').isLength({ max: 50 }),
]
//好友申请的参数校验
const AddFriend = [
    check('userId', 'userId参数不能为空').notEmpty(),
    check('friendId', 'friendId参数不能为空').notEmpty(),
]
//群聊信息参数校验
const GroupInfo = [
    // 参数校验
    // 群主id
    check('userId', 'userId参数不能为空').notEmpty(),
    // 群名
    check('groupName', '群名不能为空').notEmpty(),
    check('groupName', '群名最大不能超过15个字').isLength({ max: 15 }),
    // 群简介
    check('sign', '群名不能为空').notEmpty(),
    check('sign', '群名最大不能超过50个字').isLength({ max: 50 }),
]
//更新群信息的参数校验
const UpdateGroupInfo = [
    check('_id', '_id参数不能为空').notEmpty(),
    // 群名
    check('groupName', '群名不能为空').notEmpty(),
    check('groupName', '群名最大不能超过15个字').isLength({ max: 15 }),
    // 群简介
    check('sign', '群名不能为空').notEmpty(),
    check('sign', '群名最大不能超过50个字').isLength({ max: 50 }),
]
const addSpace = [
    check('userId', 'userId参数不能为空').notEmpty(),
    check('textDesc', '文字内容最大不能超过200个字').isLength({ max: 200 }),
]
module.exports = {
    UpdateInfo,
    RegisterInfo,
    AddFriend,
    GroupInfo,
    UpdateGroupInfo,
    addSpace
}