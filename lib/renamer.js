const os = require('os');
function directory(name, format) {
  let newName = '';
  if (!/[0-9A-Z]{32}/.test(name)) {
    if (format === 'original') {
      newName = name;
    } else if (format === 'nospaces') {
      newName = name.replace(/\s/g, '');
    } else if (format === 'snake_case') {
      newName = name.replace(/\s/g, '_').toLowerCase();
    } else if (format === 'dash-case') {
      newName = name.replace(/\s/g, '-').toLowerCase();
    }
  }
  if (os.platform() === 'win32') {
    newName = newName.replace(/[<>\|\?\*"\/:]/g, '');
  }
  return newName;
}

function file(name, format) {
  if(format.indexOf('original') ===0) {
    return name;
  } else if(format.indexOf('remove-id') === 0) {
    return name.replace(/-[0-9A-Z]{32}/, '');
  }
}

module.exports = {
  directory,
  file
};
