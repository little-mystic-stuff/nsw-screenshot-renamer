function print(text) {
  if(global.args.workMode === 'cmd') {
    process.stdout.write(`${text}\n`);
  }
}

module.exports = print;
