const fs = require('fs');
const path = require('path');
const commander = require('commander');
const program = new commander.Command();
const rename = require(`${__dirname}/lib/renamer.js`);

const gameIds = require(`${__dirname}/game-ids.json`);


program
  .addOption(new commander.Option('--mode <mode>', 'move/copy files or fix directory names')
    .choices(['copy', 'move', 'fix-names'])
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
    .default('remove-id', 'remove game id from original switch filename'));
program.version('1.0.0', '-v, --version', 'current version of program');
program.parse();
const args = program.opts();


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

if (args.mode !== 'fix-names') {
  const files = getFiles(args.input);
  files.forEach((file) => {
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
    } else if (args.mode === 'move') {
      fs.renameSync(file, path.resolve(`${workPath}/${newFilename}`));
    }
  });
  if (args.mode === 'move') {
    fs.rmdirSync(args.input, {recursive: true});
  }
} else {
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
}
