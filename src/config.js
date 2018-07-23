const Conf = require('conf');
const path = require('path');
const config = new Conf();
let key_download_dir = 'downloadDir';

let setDownloadDir = (downloadDir) => {
    config.set(key_download_dir, downloadDir);
};

let unsetDownloadDir = () => {
    config.delete(key_download_dir);
};

let getDefaultDir = () => {
    let defaultDownloadDir = path.join(__dirname, '../downloads/');
    console.info('get default download dir: ' + defaultDownloadDir);
    return defaultDownloadDir;
};

let getDownloadDir = () => {
    let downloadDir = config.get(key_download_dir);
    if (!downloadDir) {
        downloadDir = getDefaultDir();
    }
    return downloadDir;
};


module.exports = {
    unsetDownloadDir,
    setDownloadDir,
    getDefaultDir,
    getDownloadDir,
};
