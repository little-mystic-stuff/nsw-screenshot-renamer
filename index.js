const fs = require('fs');
const path = require('path');
const commander = require('commander');
const Bar = require(`${__dirname}/lib/progress-bar.js`);
const rename = require(`${__dirname}/lib/renamer.js`);
const update = require(`${__dirname}/lib/updater.js`);
const org = require(`${__dirname}/lib/organizer.js`)
const print = require(`${__dirname}/lib/logger.js`);

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
program.version('1.2.1', '-v, --version', 'current version of program');
program.parse();
global.args = program.opts();

if (global.args.mode === 'copy' || global.args.mode === 'move') {
  const files = org.getFiles(global.args.input);
  const stat = org.getFilesStat(files);
  print(`${files.length} files found: ${stat.jpg} images, ${stat.mp4} videos`);
  const bar = new Bar(files.length);
  let counter = 0;
  files.forEach((file, i) => {
    const filename = path.basename(file);
    const format = filename.split('.')[1];
    const title = org.getGameTitle(filename);
    const newTitle = rename.directory(title, global.args.directoryFormat);
    let workPath = path.resolve(`${global.args.output}/${newTitle}`);
    org.mkdirIfNotExistsSync(workPath);
    if (format.indexOf('jpg') === 0) {
      org.mkdirIfNotExistsSync(`${workPath}/images`);
      workPath = path.resolve(`${workPath}/images`);
    } else if (format.indexOf('mp4') === 0) {
      org.mkdirIfNotExistsSync(`${workPath}/videos`);
      workPath = path.resolve(`${workPath}/videos`);
    }
    const newFilename = rename.file(filename, global.args.fileFormat);
    if (global.args.mode === 'copy') {
      fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
      bar.update(i);
    } else if (global.args.mode === 'move') {
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
  if (global.args.mode === 'move') {
    fs.rmdirSync(global.args.input, {recursive: true});
  }
} else if (global.args.mode === 'fix-names') {
  const dirs = fs.readdirSync(path.resolve(global.args.input));
  dirs.forEach((dir) => {
    const currentPath = path.resolve(`${global.args.input}/${dir}`);
    if (/[0-9A-Z]{32}/.test(dir)) {
      const newName = rename.directory(getGameTitle(dir), global.args.directoryFormat);
      if (dir !== newName) {
        fs.renameSync(currentPath, currentPath.replace(dir, newName));
        console.log(`renamed: "${dir}" to "${newName}"`);
      }
    }
  });
} else if (global.args.mode === 'update') {
  update();
}
