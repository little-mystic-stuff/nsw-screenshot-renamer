function directory(name, format) {
  if (!/[0-9A-Z]{32}/.test(name)) {
    if (format === 'original') {
      return name;
    } else if (format === 'nospaces') {
      return name.replace(/\s/g, '');
    } else if (format === 'snake_case') {
      return name.replace(/\s/g, '_').toLowerCase();
    } else if (format === 'dash-case') {
      return name.replace(/\s/g, '-').toLowerCase();
    }
  }
  return name;
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
