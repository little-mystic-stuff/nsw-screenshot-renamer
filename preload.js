const update = require(`${__dirname}/lib/updater.js`);
const org = require(`${__dirname}/lib/organizer.js`);
const print = require(`${__dirname}/lib/logger.js`);
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

let status = 'idle';

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
  button.disabled = !checkArgs() || status === 'work';
}

window.addEventListener('DOMContentLoaded', () => {
  const btUpdate = document.getElementById('bt_update');
  btUpdate.addEventListener('click', (e) => {
    update();
  });

  const txtLogger = document.getElementById('txt_logger');
  global.args.guiLog = txtLogger;

  const worker = new Worker(`${__dirname}/lib/worker.js`);
  worker.onmessage = (e) => {
    const text = e.data;
    if (text === 'ok') {
      status = 'idle';
    } else {
      print(text);
    }
  }
  const btProceed = document.getElementById('bt_proceed');
  btProceed.addEventListener('click', (e) => {
    btProceed.disabled = true;
    status = 'work';
    print('Working...')
    worker.postMessage(JSON.parse(JSON.stringify(global.args)));
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
