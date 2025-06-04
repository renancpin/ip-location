import fs from 'fs';
import path from 'path';

export function makePath(fullpath: string) {
  const parentDir = path.dirname(path.resolve(fullpath));
  fs.mkdirSync(parentDir, { recursive: true });
}
