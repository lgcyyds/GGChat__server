
const logMiddleware = (req, res, next) => {
    if (req.headers.token) {
        console.log(req.headers.token);
        next()
    } else {
        next()
    }

    // next() // 调用 next() 将控制权交给下一个中间件或路由处理程序
}
module.exports = logMiddleware