const fs = require('fs');
const path = require('path');
const https = require('https');
const commander = require('commander');
const Bar = require(`${__dirname}/lib/progress-bar.js`);
const rename = require(`${__dirname}/lib/renamer.js`);
const gameIds = require(`${__dirname}/game-ids.json`);

const program = new commander.Command();
program
  .addOption(new commander.Option('--mode <mode>', 'move/copy files, fix directory names or update game base')
    .choices(['copy', 'move', 'fix-names', 'update'])
    .default('copy', 'copy files'))
  .addOption(new commander.Option('--input <path>', 'path to Screenshots folder')
    .default('./', 'current directory'))
  .addOption(new commander.Option('--output <path>', 'path to result directory')
    .default('./', 'current directory'))
  .addOption(new commander.Option('--directory-format <format>', 'format for directory name (doesnt work yet)')
    .choices(['original', 'nospaces', 'snake_case', 'dash-case'])
    .default('original', 'original game title'))
  .addOption(new commander.Option('--file-format <format>', 'format for files')
    .choices(['original', 'remove-id'])
    .default('remove-id', 'remove game id from original switch filename'))
  .addOption(new commander.Option('--work-mode <value>')
    .choices(['cmd', 'gui'])
    .default('cmd')
    .hideHelp());
program.version('1.2.0', '-v, --version', 'current version of program');
program.parse();
const args = program.opts();

function print(text) {
  if(args.workMode === 'cmd') {
    process.stdout.write(`${text}\n`);
  }
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

function mkdirIfNotExistsSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function getGameTitle(filename) {
  const id = /[0-9A-Z]{32}/.exec(filename);
  if (id !== null) {
    return gameIds[id] === undefined ? id[0] : gameIds[id];
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

if (args.mode === 'copy' || args.mode === 'move') {
  const files = getFiles(args.input);
  const stat = getFilesStat(files);
  print(`${files.length} files found: ${stat.jpg} images, ${stat.mp4} videos`);
  const bar = new Bar(files.length);
  let counter = 0;
  files.forEach((file, i) => {
    const filename = path.basename(file);
    const format = filename.split('.')[1];
    const title = getGameTitle(filename);
    const newTitle = rename.directory(title, args.directoryFormat);
    let workPath = path.resolve(`${args.output}/${newTitle}`);
    mkdirIfNotExistsSync(workPath);
    if (format.indexOf('jpg') === 0) {
      mkdirIfNotExistsSync(`${workPath}/images`);
      workPath = path.resolve(`${workPath}/images`);
    } else if (format.indexOf('mp4') === 0) {
      mkdirIfNotExistsSync(`${workPath}/videos`);
      workPath = path.resolve(`${workPath}/videos`);
    }
    const newFilename = rename.file(filename, args.fileFormat);
    if (args.mode === 'copy') {
      fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
      bar.update(i);
    } else if (args.mode === 'move') {
      try {
        fs.renameSync(file, path.resolve(`${workPath}/${newFilename}`));
      } catch (error) {
        if (error.code === 'EXDEV') {
          fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
          fs.unlinkSync(file);
        }
      }
      bar.update(i);
    }
  });
  if (args.mode === 'move') {
    fs.rmdirSync(args.input, {recursive: true});
  }
} else if (args.mode === 'fix-names') {
  const dirs = fs.readdirSync(path.resolve(args.input));
  dirs.forEach((dir) => {
    const currentPath = path.resolve(`${args.input}/${dir}`);
    if (/[0-9A-Z]{32}/.test(dir)) {
      const newName = rename.directory(getGameTitle(dir), args.directoryFormat);
      if (dir !== newName) {
        fs.renameSync(currentPath, currentPath.replace(dir, newName));
        console.log(`renamed: "${dir}" to "${newName}"`);
      }
    }
  });
} else if (args.mode === 'update') {
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
        print('Something goes wrong.\n', error);
      }
    });
  }).on('error', (error) => {
    print(`Got error: ${error.message}`);
  });
}
