//计算年龄
function calculateAge(birthDate) {
    const birth = new Date(birthDate)
    const currentDate = new Date()
    let age = (currentDate - birth) / (1000 * 60 * 60 * 24 * 365)
    return Math.floor(age)
}
//计算星座
function getStart(date) {
    let dateArr = date.split('-')
    let month = dateArr[1]
    let day = dateArr[2]
    let startType = null
    switch (month) {
        case "1":
            if (day > 19) { startType = ("水瓶座") }
            else startType = ("摩羯座")
            break
        case "2":
            if (day > 18) { startType = ("双鱼座") }
            else startType = ("水瓶座")
            break
        case "3":
            if (day > 20) { startType = ("白羊座") }
            else startType = ("双鱼座")
            break
        case "4":
            if (day > 19) { startType = ("金牛座") }
            else startType = ("白羊座")
            break
        case "5":
            if (day > 20) { startType = ("双子座") }
            else startType = ("金牛座")
            break
        case "6":
            if (day > 21) { startType = ("巨蟹座") }
            else startType = ("双子座")
            break
        case "7":
            if (day > 22) { startType = ("狮子座") }
            else startType = ("巨蟹座")
            break
        case "8":
            if (day > 22) { startType = ("处女座") }
            else startType = ("狮子座")
            break
        case "9":
            if (day > 22) { startType = ("天秤座") }
            else startType = ("处女座")
            break
        case "10":
            if (day > 23) { startType = ("天蝎座") }
            else startType = ("天秤座")
            break
        case "11":
            if (day > 20) { startType = ("射手座") }
            else startType = ("天蝎座")
            break
        case "12":
            if (day > 21) { startType = ("摩羯座") }
            else startType = ("射手座")
            break
    }
    return startType
}
//计算当前时间
function getNowTime() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth()+1
    let day = date.getDate()
    return year + '-' + month + '-' + day
}
//计算当前时间（精确到分钟）
function getNowSpecTime(params) {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let min = date.getMinutes()
    return `${year}-${month}-${day} ${hour}:${min}`
}
module.exports = {
    calculateAge,
    getStart,
    getNowTime,
    getNowSpecTime
}