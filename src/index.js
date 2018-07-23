const http = require('superagent');
const fs = require('fs-extra');
const dn = require('download');
const Promise = require('bluebird');

const config = require('../config/config');
const dirConfig = require('./config');

let getUrl = (uid, album_id, page) => {
    page++;
    return 'http://photo.weibo.com/photos/get_all?uid=' + uid + '&album_id=' + album_id + '&count=100&page=' + page + '&type=3'
};

let getData = (uid, album_id) => {
    let data;
    let i = 0;
    let recursive = function (index) {
        let url = getUrl(uid, album_id, index);
        console.log('get: ', url);
        return http.get(url)
            .set('Cookie', config.cookies).then(response => {
                i++;
                let respData = JSON.parse(response.text);
                if (respData.data.photo_list.length === 0) {
                    data.uid = uid;
                    data.album_id = album_id;
                    return Promise.resolve(data);
                }
                console.log('response size: ',);
                if (!data) {
                    data = respData;
                } else {
                    data.data.photo_list = data.data.photo_list.concat(respData.data.photo_list);
                }
                console.log(data.data.photo_list.length);
                return recursive(i);
            });

    };
    return recursive(i);

};

let download = (albumData, outputDir = dirConfig.getDownloadDir()) => {
    if (albumData.data.photo_list) {
        // make output path
        let uid = albumData.uid;
        let album_id = albumData.album_id;
        let file = uid + "/" + album_id;
        let albumDir = outputDir + file;

        // ensure dir and write data
        let dataFile = albumDir + '.data.json';
        return fs.outputFile(dataFile, JSON.stringify(albumData, 0, 3))
            .then(() => {
                console.info('data-saved => ' + dataFile);
                // run download tasks
                let downloadTasks = [];
                albumData.data.photo_list.map(photo => {
                    let img_src = photo.pic_host + '/large/' + photo.pic_name;
                    downloadTasks.push(dn(img_src, albumDir).then(() => {
                        console.log('downloaded: ' + img_src);
                    }));
                });
                return Promise.all(downloadTasks);
            });
    } else {
        return Promise.reject(new Error('found no album data'));
    }
};

let uid = '2304291523';
let album_id = '3574204451659166';
getData(uid, album_id).then(data => {
    download(data);
});