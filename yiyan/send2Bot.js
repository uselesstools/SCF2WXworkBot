'use strict';


function doPost(url, post_data) {
    var request = require('request');
    return new Promise(function(resolve, reject){
    
        request.post(post_data, function(error, response, body){
            if(!error && response.statusCode == 200) {
                console.log('post ok!')
                resolve(body);
            }else{
                console.log('post error:'+error+'\nresponse:'+response);
                reject(error);
            }
        });
    });
}

var sendTextToAllBot = async function (bot_url, markdown_content){
    var post_data = {
        url: bot_url,
        json: true,
        body:
        {
            "msgtype": "text",
            "text": {
                "content": markdown_content
            }
        }
    };
    try {
        let ret = await doPost(bot_url, post_data);
        console.log('post bot result:'+ret);
    }catch(e){
        console.log('post bot error:'+e);
    }

}

var sendMarkdownToAllBot = async function (bot_url, markdown_content){
    var post_data = {
        url: bot_url,
        json: true,
        body:
        {
            "msgtype": "markdown",
            "markdown": {
                "content": markdown_content
            }
        }
    };
    try {
        let ret = await doPost(bot_url, post_data);
        console.log('post bot result:'+ret);
    }catch(e){
        console.log('post bot error:'+e);
    }

}

var sendImgToAllBot = async function(bot_url, imageData) {
    var imageBase64 = imageData.toString("base64");
    var crypto = require('crypto');
    var fsHash = crypto.createHash('md5');
    fsHash.update(imageData);
    var md5 = fsHash.digest('hex');
    console.log("文件的MD5是：%s", md5);
    var post_data = {
        url: bot_url,
        json: true,
        body:
        {
            "msgtype": "image",
            "image": {
                "base64": imageBase64,
                "md5": md5
            }
        }
    };
    try {
        let ret = await doPost(bot_url, post_data);
        console.log(ret);
    }catch(e){
        console.log('post bot error:'+e);
    }

}

var sendNewsToAllBot = async function(bot_url, url, imgUrl, title, desc) {
    var post_data = {
        url: bot_url,
        json: true,
        body:
        {
            "msgtype": "news",
            "news": {
               "articles" : [
                   {
                       "title" : title,
                       "description" : desc,
                       "url" : url,
                       "picurl" : imgUrl
                   }
                ]
            }
        }
    };
    try {
        let ret = await doPost(bot_url, post_data);
        console.log('post bot result:'+ret);
    }catch(e){
        console.log('post bot error:'+e);
    }

}


module.exports.sendTextToAllBot = sendTextToAllBot;
module.exports.sendMarkdownToAllBot = sendMarkdownToAllBot;
module.exports.sendImgToAllBot = sendImgToAllBot;
module.exports.sendNewsToAllBot = sendNewsToAllBot;