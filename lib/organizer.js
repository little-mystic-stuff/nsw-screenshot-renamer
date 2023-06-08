const fs = require('fs');
const path = require('path');
let gameIds = require(`${__dirname}/../game-ids.json`);

function reloadBase() {
  gameIds = JSON.parse(localStorage.getItem('base'));
  console.log(gameIds);
}

function mkdirIfNotExistsSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function getFiles(dirPath) {
  const files = [];
  const readDir = (dirPath) => {
    fs.readdirSync(dirPath).forEach(item => {
      const currentItem = path.join(dirPath, item);
      if (fs.statSync(currentItem).isDirectory()) {
        readDir(currentItem);
      } else {
        files.push(currentItem);
      }
    });
  }
  readDir(dirPath);
  return files;
}

function getFilesStat(files) {
  let jpg = 0;
  let mp4 = 0;
  files.forEach((file) => {
    const format = path.basename(file).split('.')[1];
    if (format === 'jpg') {
      jpg++;
    } else if (format === 'mp4') {
      mp4++;
    }
  });
  return {jpg, mp4};
}

function getGameTitle(filename) {
  const id = /[0-9A-Z]{32}/.exec(filename);
  if (id !== null) {
    return gameIds[id] === undefined ? id[0] : gameIds[id];
  }
}

module.exports = {
  mkdirIfNotExistsSync,
  getFiles,
  getFilesStat,
  getGameTitle,
  reloadBase
}
