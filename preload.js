const update = require(`${__dirname}/lib/updater.js`);
const org = require(`${__dirname}/lib/organizer.js`);
const print = require(`${__dirname}/lib/logger.js`);
const rename = require(`${__dirname}/lib/renamer.js`);
const path = require('path');
const fs = require('fs');
const {ipcRenderer} = require('electron');

global.args = {};
global.args.input = null;
global.args.output = null;
global.args.mode = 'copy';
global.args.directoryFormat = 'original';
global.args.fileFormat = 'remove-ids';
global.args.workMode = 'gui';
global.args.guiLog = null;

function checkBase() {
  const base = localStorage.getItem('base');
  if (base === null) {
    print('Please update game base first.')
  }
}

function checkInputNintendoDirectory(path) {
  return path !== null && org.getFiles(path).every((elem) => {
    return /\/20\d{2}\/\d{2}\/\d{2}\/\d{16}-[0-9A-Z]{32}\..{3}/.test(elem.replace(path, ''));
  });
}

function checkArgs() {
  if (global.args.mode === 'fix-names' && global.args.input !== null) {
    return true;
  } else if (
    (global.args.mode === 'copy' || global.args.mode === 'move')
    && global.args.input !== null
    && checkInputNintendoDirectory(global.args.input)
    && global.args.output !== null
  ) {
    return true;
  }
  return false;
}

function setFinalButtonStatus (button) {
  button.disabled = !checkArgs();
}

window.addEventListener('DOMContentLoaded', () => {

  const btUpdate = document.getElementById('bt_update');
  btUpdate.addEventListener('click', (e) => {
    update();
  });

  const txtLogger = document.getElementById('txt_logger');
  global.args.guiLog = txtLogger;

  const btProceed = document.getElementById('bt_proceed');
  btProceed.addEventListener('click', (e) => {
    btProceed.disabled = true;
    if (global.args.mode === 'copy' || global.args.mode === 'move') {
      const files = org.getFiles(global.args.input);
      const all = files.length;
      let counter = 0;
      files.forEach((file, i) => {
        const filename = path.basename(file);
        const format = filename.split('.')[1];
        const title = org.getGameTitle(filename);
        let newTitle = rename.directory(title, global.args.directoryFormat);
        let workPath = path.resolve(`${global.args.output}/${newTitle}`);
        try {
          org.mkdirIfNotExistsSync(workPath);
        } catch (error) {
          if (error.code === 'ENOENT') {
            newTitle = rename.directory(title, global.args.directoryFormat, true);
            workPath = path.resolve(`${global.args.output}/${newTitle}`);
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
        const newFilename = rename.file(filename, global.args.fileFormat);
        if (global.args.mode === 'copy') {
          fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
          counter++;
          const kek = ipcRenderer.sendSync('pb_tick', {current: counter, all: all});
        } else if (global.args.mode === 'move') {
          try {
            fs.renameSync(file, path.resolve(`${workPath}/${newFilename}`));
            counter++;
            print(`File "${filename}" moved to "${newTitle}" directory. ${counter}\\${all}`);
          } catch (error) {
            if (error.code === 'EXDEV') {
              fs.copyFileSync(file, path.resolve(`${workPath}/${newFilename}`));
              fs.unlinkSync(file);
              counter++;
              print(`File "${filename}" moved to "${newTitle}" directory. ${counter}\\${all}`);
            }
          }
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
          const newName = rename.directory(org.getGameTitle(dir), global.args.directoryFormat);
          if (dir !== newName) {
            fs.renameSync(currentPath, currentPath.replace(dir, newName));
            print(`renamed: "${dir}" to "${newName}"`);
          }
        }
      });
    }
  });

  const inpInput = document.getElementById("inp_input");
  const btInput = document.getElementById("bt_input");
  btInput.addEventListener('click', (e) => {
    const path = ipcRenderer.sendSync('selectDirectory', {mode: 'input', title: 'Select input directory'});
    if (path !== undefined) {
      inpInput.value = path[0];
      global.args.input = path[0];
      if (global.args.mode === 'copy' || global.args.mode === 'move') {
        if (checkInputNintendoDirectory(path[0])){
          const files = org.getFiles(path[0]);
          const stat = org.getFilesStat(files);
          print(`${files.length} files found: ${stat.jpg} images, ${stat.mp4} videos`);
        } else {
          print('Current input files doesn\'t look like a nintendo screenshots directory.');
        }
      }
    }
    setFinalButtonStatus(btProceed);
  });

  const inpOutput = document.getElementById("inp_output");
  const btOutput = document.getElementById("bt_output");
  btOutput.addEventListener('click', (e) => {
    const path = ipcRenderer.sendSync('selectDirectory', {mode: 'output', title: 'Select output directory'});
    if (path !== undefined) {
      inpOutput.value = path[0];
      global.args.output = path[0];
    }
    setFinalButtonStatus(btProceed);
  });

  const radioButtons = document.querySelectorAll('label input');
  radioButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const name = e.target.getAttribute('name');
      const value =  e.target.getAttribute('value');
      global.args[name] = value;
      if (name === 'mode' && (value === 'copy' || value === 'move')) {
        if (global.args.input !== null && !checkInputNintendoDirectory(global.args.input)) {
          print('Current input files doesn\'t look like a nintendo screenshots directory.');
        }
      }
      setFinalButtonStatus(btProceed);
    });
  });

  checkBase();
})
