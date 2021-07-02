const fs = require('fs');
const path = require('path')
const https = require('https');
const print = require('./logger.js');

function update() {
  const url = 'https://raw.githubusercontent.com/little-mystic-stuff/nsw-screenshot-renamer/master/game-ids.json';
  https.get(url, (res) => {
    print(`Requesting to ${url}`);
    const { statusCode } = res;
    if (statusCode !== 200) {
      print(`Something goes wrong. Status code: ${statusCode}`);
      return;
    };
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        fs.writeFileSync(path.resolve(`${__dirname}/game-ids.json`), rawData);
        print('Game base succesfully updated.');
      } catch (error) {
        print(`Something goes wrong with writing file.\n${error}`);
      }
    });
  }).on('error', (error) => {
    print(`Got error: ${error.message}`);
  });
}

module.exports = update;
