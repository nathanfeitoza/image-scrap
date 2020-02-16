const request = require('request-promise');
const cheerio = require('cheerio');

function requestPromisse(url) {
    const options = {
        url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
        },
        transform: function(body, response) {
          return cheerio.load(body);
        }
      };

    return new Promise((resolve, reject) => {
      request.get(options)
      .then(($) => {
            resolve($);
        })
        .catch((err) => {
          reject(err);
        })
    })
}

clearBase64Image = function(base64) {
    let image = decodeURI(base64).replace(/\s/g,'');
    image = image.replace(/\\x3d/gi,'');

    return image;
}

requestDataShopping = function(url) {
    return new Promise((resolve, reject) => {
        requestPromisse(url)
            .then(($) => {
                const shopping = [];
                const scripts = $('script');
                let googleLdi = '';
                let thumbs = {};

                scripts.each(function() {
                    const val = $(this).html();

                    if (val.indexOf('google.ldi') != -1) {
                        googleLdi = val;
                    }
                })

                let matchScript = googleLdi.match(/google.ldi=(.*)/gi);

                if (matchScript[0] != undefined || matchScript[0] != null) {
                    matchScript = matchScript[0]
                    
                    const thumbsScript = matchScript.replace(/\n|\r|\r\n/, '')
                        .replace(/;google.pim={}+(.*)/gi, '')
                        .replace(/google.ldi=/gi, '');

                    try {
                        Object.assign(thumbs, JSON.parse(thumbsScript))
                    } catch(err) {
                        console.log(err)
                    }
                }

                const getThumbProduct = (thumbId) => {
                    const scriptsNonce = $('script[nonce]')
                    let thumbImage = thumbs[thumbId];

                    if (thumbImage != undefined) {
                        return thumbImage;
                    }

                    scriptsNonce.each(function() {
                        let analyseThumb = $(this).html();

                        if (analyseThumb.indexOf(thumbId) != -1) {
                            analyseThumb = analyseThumb.match(/var s='(.*)';/);
                        
                            if (analyseThumb[1]) {
                                thumbImage = clearBase64Image(analyseThumb[1]);
                                return thumbImage;
                            }
                        }
                    })

                    return thumbImage;
                }

                $('.sh-dlr__list-result').each(function() {
                    const nodeNameAndLink = $(this).find('.mASaeb');
                    const nodePrice = $(this).find('.h1Wfwb.O8U6h');
                    const nodeThumb = $(this).find('.sh-dlr__thumbnail');
                    const nameProduct = nodeNameAndLink.find('.xsRiS').html();
                    const linkProduct = 'http://images.google.com' 
                        + nodeNameAndLink.find('a').attr('href');
                    const thumbId = nodeThumb.find('img').attr('id');
                    const thumbProduct = getThumbProduct(thumbId);
                    let priceProduct = nodePrice.find('span[aria-hidden="true"]').html();
                    priceProduct = priceProduct.replace('&#xA0;', ' ');

                    const dataAdd = {
                        name: nameProduct,
                        thumb: thumbProduct,
                        link: linkProduct,
                        price: priceProduct
                    };

                    shopping.push(dataAdd)
                })
                
                resolve(shopping)
            }).catch(() => console.log(err))
    })
}

function requestImages(urlImage) {
    const url = 'http://images.google.com/searchbyimage?image_url=' + urlImage;

    return new Promise((resolve, reject) => {
      
      requestPromisse(url)
        .then(($) => {
            const initArrayScripts = 11;
            const element = $('#iur .bia img');
            const quantity = element.length;
            const finalArrayScripts = initArrayScripts + (quantity - 1);
            const images = [];
            const shopping = [];
            
            for (let i = initArrayScripts; i <= finalArrayScripts; i++) {
                let analyse = $('script[nonce]:nth-child(' + (i + 1) + ')')
                    .html();
                
                if (analyse !== null) {
                    analyse = analyse.match(/var s='(.*)';/);
                    
                    if (analyse[1]) {
                        const imageAdd = clearBase64Image(analyse[1]);
                        images.push(imageAdd)
                    }
                }
            }
            
            let retorno = {
                total_images: images.length,
                images: images,
                shopping: shopping
            };

            let urlShopping = $('#hdtb-msb-vis a')[2].attribs.href;

            if (urlShopping != undefined) {
                urlShopping = 'http://images.google.com' + urlShopping;
                requestDataShopping(urlShopping).then((shopping) => {
                    retorno.shopping = shopping;
                    resolve(retorno);
                });
                
                return;
            } 

            resolve(retorno);
        })
        .catch((err) => {
          reject(err);
        })
    })
}

exports.requestImages = requestImages;