const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req,file, cb)=>{
        cb(null,"./uploads")
    },
    filename:(req, file, cb)=>[
        cb(null,`${Date.now()}-${file.originalname}`)
    ]
})

const fileFilter =(req, file, cb)=>{
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif',]
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error('Only .jpeg, .jpg, .png, .gif format allowed!'), false)
    }
}

const upload = multer({
storage,
fileFilter,
limits:{
    fileSize: 1024 * 1024 * 5
}
}).array("productImage", 5)

module.exports = upload;