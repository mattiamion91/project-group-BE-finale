//middlewares/imagePath.js
function imagePath(folder) {
    return (req, res, next) => {
        req.imagePath = `${req.protocol}://${req.get('host')}/images/${folder}/`;
        next();
    };
}

module.exports = imagePath;