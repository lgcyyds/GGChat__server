const mongoose = require('mongoose')
module.exports = function (success, error) {
    if (typeof error !== 'function') {
        error = () => {
            console.log("连接失败");

        }
    }
    mongoose.set('strictQuery', true)
    mongoose.connect('mongodb://localhost:27017/GGchat')

    let db = mongoose.connection
    db.once('open', () => {
        success()
    })
    db.on('error', () => {
        error()
    })
    db.on('close', () => {
        console.log('连接关闭');

    })
}
