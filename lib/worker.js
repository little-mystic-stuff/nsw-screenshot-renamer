const rename = require(`${__dirname}/renamer.js`);
const org = require(`${__dirname}/organizer.js`);
const path = require('path');
const fs = require('fs');

onmessage = (e) => {
  const args = e.data;
  if (args.mode === 'copy' || args.mode === 'move') {
    const files = org.getFiles(args.input);
    const all = files.length;
    let counter = 0;
    files.forEach((file, i) => {
      const filename = path.basename(file);
      const format = filename.split('.')[1];
      const title = org.getGameTitle(filename);
      let newTitle = rename.directory(title, args.directoryFormat);
      let workPath = path.resolve(`${args.output}/${newTitle}`);
      try {
        org.mkdirIfNotExistsSync(workPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          newTitle = rename.directory(title, args.directoryFormat, true);
          workPath = path.resolve(`${args.output}/${newTitle}`);
          org.mkdirIfNotExistsSync(workPath);
        }
      }

      if (format.indexOf('jpg') === 0) {
        org.mkdirIfNotExistsSync(`${workPath}/images`);
        workPath = path.resolve(`${workPath}/images`);
      } else if (format.indexOf('mp4') === 0) {
        org.mkdirIfNotExistsSync(`${workPath}/videos`);
        workPath = path.resolve(`${workPath}/videos`);
      }
      const newFilename = rename.file(filename, args.fileFormat);
      if (args.mode === 'copy') {
        fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
        counter++;
        postMessage(`File "${filename}" copied to "${newTitle}" directory. ${counter}\\${all}`);
      } else if (args.mode === 'move') {
        try {
          fs.renameSync(file, path.resolve(`${workPath}/${newFilename}`));
          counter++;
          postMessage(`File "${filename}" moved to "${newTitle}" directory. ${counter}\\${all}`);
        } catch (error) {
          if (error.code === 'EXDEV') {
            fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
            fs.unlinkSync(file);
            counter++;
            postMessage(`File "${filename}" moved to "${newTitle}" directory. ${counter}\\${all}`);
          }
        }
      }
    });
    if (args.mode === 'move') {
      fs.rmdirSync(args.input, {recursive: true});
    }
    postMessage('Job well done!\n\nThanks for use this tool.\nYou\'re great!')
  } else if (args.mode === 'fix-names') {
    const dirs = fs.readdirSync(path.resolve(args.input));
    dirs.forEach((dir) => {
      const currentPath = path.resolve(`${args.input}/${dir}`);
      if (/[0-9A-Z]{32}/.test(dir)) {
        const newName = rename.directory(org.getGameTitle(dir), args.directoryFormat);
        if (dir !== newName) {
          fs.renameSync(currentPath, currentPath.replace(dir, newName));
          postMessage(`"${dir}" was renamed to "${newName}"`);
        }
      }
    });
  }
  postMessage('ok');
}
