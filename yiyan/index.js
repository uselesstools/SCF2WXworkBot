'use strict';

var type_dic = {
    'a':'动画',
    'b':'漫画',
    'c':'游戏',
    'd':'小说',
    'e':'原创',
    'f':'来自网络',
    'g':'其他',
};

function doRequest(url) {
    var request = require('request');
    return new Promise(function(resolve, reject){
        request(url, {headers: { 'User-Agent': 'Mozilla/5.0' } }, function(error, response, body){
            if(!error && response.statusCode == 200) {
                console.log('request ok!')
                resolve(body);
            }else{
                console.log('req error:'+error+'\nresponse code:'+response.statusCode);
                reject(error);
            }
        });
    });
}

function doRequestBinary(url) {
    var request = require('request');
    return new Promise(function(resolve, reject){
        request.get({url:url, encoding: null, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(error, response, body){
            if(!error && response.statusCode == 200) {
                console.log('req binary ok!')
                resolve(body);
            }else{
                console.log('req binary error:'+error+'\nresponse code:'+response.statusCode);
                reject(error);
            }
        });
    });
}

function writeFileAsync(file_path, file_data) {
    var fs = require('fs');
    return new Promise(function(resolve, reject){
        fs.writeFile(file_path, file_data, 'binary', function(err){
            if(err)
              reject(err);
            else
              resolve("The file was saved!");
        });

    });
}



function transformHitokotoData(body) {

    var content = "男人就应该保持冷静，沸腾的水只会被蒸发掉。";
    var from = "假面骑士kabuto";
    var type = 'a';
    try{
        var json_data = JSON.parse(body);
        content = json_data.hitokoto;
        from = json_data.from;
        type = json_data.type;
    }catch(e){
        console.log(e);
    }
    console.log(body);
    var type_str = type_dic[type];
    return [content, from, type_str];
}


var bot_url = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=3588a462-1cc2-4bac-9595-f4fd9044d288';



async function main() {
    try {
        let ret = await doRequest('https://v1.hitokoto.cn/');
        var retList = transformHitokotoData(ret);
        console.log('result:'+retList);
        var content = '## 一言\n>'+retList[0]+'\n\n                    --《'+retList[1]+'》('+retList[2]+')';
        console.log('send content'+content);

        var bot = require('./send2Bot');
        await bot.sendMarkdownToAllBot(bot_url, content);
        console.log('send bot ok');
    }catch(e){
        console.log('error:'+e);
    }
}


async function main2() {
    try {
        var fs = require('fs');
        
        //读取一个Buffer
        var buffer = fs.readFileSync('./emoji.gif');

        var bot = require('./send2Bot');
        await bot.sendImgToAllBot(bot_url, buffer);
        console.log('send bot ok');
    }catch(e){
        console.log('error:'+e);
    }
}

function transformGangData(body) {

    var retList = [];
    try{
        var json_data = JSON.parse(body);
        console.log(json_data);
        var error = json_data['error'];
        if(error == false) {
            retList = json_data.results;
        }
    }catch(e){
        console.log(e);
    }
    return retList;
}


async function main3() {
    try{
        let ret = await doRequest('http://gank.io/api/data/%E7%A6%8F%E5%88%A9/20/1');
        var list = transformGangData(ret);

        var index = Math.floor(Math.random() *20);
        console.log('index:' + index);
        var urlImage = list[index].url;
        console.log(urlImage);
        let imageData = await doRequestBinary(urlImage);

        // await writeFileAsync('./1.jpg', imageData);
        var bot = require('./send2Bot');
        await bot.sendImgToAllBot(bot_url, imageData);
        await bot.sendTextToAllBot(bot_url, '休息，休息一下，喝杯水吧！');
        console.log('send bot ok');

    }catch(e) {
        console.log(e);
    }
}
function transformGangInfoData(body) {

    var retList = [];
    try{
        var json_data = JSON.parse(body);
        console.log(json_data);
        var error = json_data['error'];
        if(error == false) {
            retList = json_data.results;
        }
    }catch(e){
        console.log(e);
    }
    return retList;
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
async function main4() {
    try {
        var index = Math.floor(Math.random() *9000)+1;
        var req_url = 'http://gank.io/api/data/all/1/'+index;
        console.log(req_url);
        let ret = await doRequest(req_url);
        let infoData = transformGangInfoData(ret)[0];
        console.log(infoData);

        var img_url = '';
        var i = 0;
        do{
            if(i>0) {
                await sleep(10*1000);
            }
            i++;
            var index2 = Math.floor(Math.random() *600)+1;
            var req_url2 = 'http://gank.io/api/data/%E7%A6%8F%E5%88%A9/1/'+index2;
            console.log(req_url2);
            let retImg = await doRequest(req_url2);
            var imageData = transformGangData(retImg)[0];
            var create_date = new Date(imageData.createdAt).getTime();
            var diff = Date.now() - create_date;
            var diffDay = Math.round(diff/(24*60*60*1000));
            console.log(diffDay+'天');
            img_url = imageData.url;
            console.log('img url:'+img_url);
            
        }while(diffDay>1440 || img_url.indexOf('clouddn.com')>0);//图片太老或者来自于clouddn.com图片就要重新再取一次图片

        console.log('final image url:'+img_url);
        var bot = require('./send2Bot');
        await bot.sendNewsToAllBot(bot_url, infoData.url, img_url, infoData.desc, '('+infoData.type+')'+infoData.publishedAt);
        console.log('send bot ok');
    }catch(e) {
        console.log(e);
    }
}

exports.main_handler = async (event, context, callback) => {
    await main4();
};


main4();