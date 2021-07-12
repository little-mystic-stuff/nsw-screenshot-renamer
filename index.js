const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const update = require(`${__dirname}/lib/updater.js`);



function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
  return win;
}

function selectDirectoryDialog(window, params) {
  const props = [
    "openDirectory",
    "dontAddToRecent"
  ];
  if (params.mode === 'output') {
    props.push('createDirectory');
    props.push('promptToCreate');
  }
  const path = dialog.showOpenDialogSync(
    window, {
    title: params.title,
    properties: props
  });
  return path;
}

let window = null;
app.whenReady().then(() => {
  window = createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  ipcMain.on('selectDirectory', (event, data) => {
    const path = selectDirectoryDialog(window, data);
    event.returnValue = path;
  });

  ipcMain.on('pb_tick', (event, data) => {
    const value = data.current / data.all;
    window.setProgressBar(value);
    window.setTitle = `${data.current}`;
    event.returnValue = null;
  })

  window.webContents.on('new-window', function(e, url) {
  e.preventDefault();
  shell.openExternal(url);
});

});
