import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'server-db-store.json');
if (fs.existsSync(STORE_PATH)) {
  fs.unlinkSync(STORE_PATH);
}
console.log('Deleted store file');
