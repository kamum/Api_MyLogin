const multer = require('multer');
const path = require('path');

module.exports =(multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/upload/users')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + req.usuarioId + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoimg = ['image/png', 'image/jpg', 'image/jpeg'].find(formatAccept => formatAccept == file.mimetype);

        if(extensaoimg){
            return cb(null, true);
        }
        return cb(null, false);
    }
}));