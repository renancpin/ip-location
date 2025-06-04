export function progressWatcher(options?: {
  message?: string | ((props: { progress: number; elapsed: number }) => string);
  interval?: number;
}) {
  const ASCII_HIDE_CURSOR = '\x1B[?25l';
  const ASCII_SHOW_CURSOR = '\u001B[?25h';

  const {
    message = 'Progress: $progress. Time elapsed: $elapsedms',
    interval = 1000,
  } = options ?? {};

  return (() => {
    let progress = 0;
    let checkpoint = 0;
    let timeout: NodeJS.Timeout;

    return {
      start: function () {
        this.setCheckpoint();
        process.stdout.write(ASCII_HIDE_CURSOR);
        timeout = setInterval(() => {
          process.stdout.write(this.getMessage() + '\r');
        }, interval);
        return this;
      },
      increment: function (value?: number) {
        progress += value ?? 1;
        return this;
      },
      stop: function () {
        clearInterval(timeout);
        process.stdout.write(ASCII_SHOW_CURSOR);
        return this;
      },
      setCheckpoint: function () {
        checkpoint = Date.now();
        return this;
      },
      getCheckpoint: function () {
        return checkpoint;
      },
      getCurrent: function () {
        return { progress, elapsed: Date.now() - checkpoint };
      },
      getMessage: function () {
        if (typeof message === 'function') {
          return message(this.getCurrent());
        }
        const { progress, elapsed } = this.getCurrent();
        return message
          .replace('$progress', `${progress}`)
          .replace('$elapsed', `${elapsed}`);
      },
    };
  })();
}
