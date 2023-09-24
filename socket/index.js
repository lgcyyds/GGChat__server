const socket_mongo = require('../socket/socket_mongo')

module.exports = (io) => {
    let users = {}
    //socket服务器实例io监听连接时候的事件
    io.on('connection', (socket) => {
        //用户登录
        socket.on('login', async (userId) => {            
            socket.name = userId
            users[userId] = socket.id
            socket.emit('login', socket.id)
            try {
                //刚登陆的时候没人申请所以没有显示申请数量要先查一次
                let friendNoticeNum = await socket_mongo.friendNoticeNum(userId)
                let groupNoticeNum = await socket_mongo.groupNoticeNum(userId)
                socket.emit('notice_num', {
                    friendNoticeNum, groupNoticeNum
                })                
            } catch (error) {
                console.log(error);
            }

        })
        //一对一私聊
        socket.on('private_chat', async (dataMsg, uId, fId) => {
            try {
                await socket_mongo.savePrivateChatMsg({ dataMsg, uId, fId })
                let data = {
                    userId: dataMsg.userId,
                    msgType: dataMsg.msgType,
                    message: dataMsg.message,
                    time: new Date(),
                    fromId: uId,
                    toId: fId
                }    
                socket.to(users[fId]).emit('private_chat', data)                
                //除了把信息发给接收者，还要给接收者未读信息的消息,uId用于清除缓存，谁发送给我的就清除跟谁的缓存
                socket.to(users[fId]).emit('unread_message', uId)
            } catch (error) {
                console.log(error);
            }
        })
        //加入群聊
        socket.on('join_group', (gId) => {
            socket.join(gId)
        })
        //群聊
        socket.on('group_chat', async (dataMsg, uId, gId) => {
            try {
                await socket_mongo.saveGroupChatMsg({ dataMsg, uId, gId })
                let data = {
                    userId: dataMsg.userId,
                    msgType: dataMsg.msgType,
                    message: dataMsg.message,
                    time: new Date(),
                    fromId: uId,
                    toId: gId
                }
                socket.to(gId).emit('group_chat', data)
                socket.to(gId).emit('unread_message',gId)
            } catch (error) {
                console.log(error);

            }

        })
        //申请消息
        socket.on('apply_notice', async (toId) => {
            try {                
                let friendNoticeNum = await socket_mongo.friendNoticeNum(toId)
                let groupNoticeNum = await socket_mongo.groupNoticeNum(toId)
                socket.to(users[toId]).emit('apply_notice', {
                    friendNoticeNum, groupNoticeNum
                })
            } catch (error){
                console.log(error);
            }
        })
        //断开连接
        socket.on('disconnect', () => {
            if (users.hasOwnProperty(socket.name)) {
                //删除users里面的用户登录用户退出连接
                delete users[socket.name]
            }
        })
    })
}