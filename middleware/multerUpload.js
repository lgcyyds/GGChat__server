const multer = require('multer')
const fs = require('fs')
function createFolder(folder) {
    try {
        fs.accessSync(folder)
    } catch (error) {
        fs.mkdirSync(folder)
    }
}
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //根据不同路径存入不同名文件夹
        let name = req.path.split('/').slice(-2, -1)[0]
        createFolder(`./upload/${name}`)
        cb(null, `./upload/${name}`)  
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })
module.exports = upload