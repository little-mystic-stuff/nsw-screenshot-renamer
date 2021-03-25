const rl = require('readline');

class bar {
  constructor(size) {
    this.size = size;
    this.cursor = 0;
    this.MAX_SYMBOLS = 31;
    this.cursorText = 33;
  }

  _render(value, delta) {
    if (delta === 0 && this.cursor === 0) {
      process.stdout.write("\x1B[?25l")
      process.stdout.write('[');
      for(let i = 1; i < this.MAX_SYMBOLS; i++) {
        process.stdout.write('-');
      }
      process.stdout.write(']');
      this.cursor++;
    } else if (delta !== this.cursor - 1 && delta > 0) {
      rl.cursorTo(process.stdout, this.cursor, null);
      process.stdout.write('=');
      this.cursor++;
    }
    rl.cursorTo(process.stdout, this.cursorText, null);
    process.stdout.write(`${value}/${this.size}`);
  }

  update(value) {
    if (value < this.size - 1) {
      const step = this.size / (this.MAX_SYMBOLS - 1) ;
      const delta = Math.round(value / step );
      this._render(value, delta);
    } else if (value === this.size - 1) {
      process.stdout.write("\x1B[?25h");
      process.stdout.write('\n');
    }
  }
}

module.exports = bar;
