
const imgur = require('imgur');
const path = './imgur';

imgur.setClientId(process.env.API_KEY_IMGUR);

const uploadImgur = function (base64) {
    let imgurFavicon = base64.replace(/data:image\/(.*);base64,/gi, '')

    return new Promise((resolve, reject) => {
        imgur.uploadBase64(imgurFavicon)
            .then(function (json) {
                resolve(json.data.link);
            })
            .catch(function (err) {
                reject(err.message);
            });
    })
};

exports.uploadImgur = uploadImgur;