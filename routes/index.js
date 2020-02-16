var express = require('express');
var router = express.Router();

const upload = require('../bin/upload.js');
const scrapping = require('../bin/scrapping.js');

/* GET home page. */
router.post('/get_data_image', function(req, res, next) {
    const base64Image = req.body.imageBase64;
    
    if (base64Image == undefined) {
        res.status(401).json({
            error: true,
            msg: "No image base64 sended"
        })
        return;
    }

    upload.uploadImgur(base64Image)
        .then((link) => {
            scrapping.requestImages(link)
                .then((data) => {
                    res.json(data)
                }).catch(err => console.log(err))
        }).catch(err => console.log(err))
  
});

module.exports = router;
