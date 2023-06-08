function print(text) {
  if(global.args.workMode === 'cmd') {
    process.stdout.write(`${text}\n`);
  } else if (global.args.workMode === 'gui') {
    global.args.guiLog.innerHTML = global.args.guiLog.innerHTML + `${text}<br>`;
    global.args.guiLog.scrollTop = global.args.guiLog.scrollHeight;
  }
}

module.exports = print;
