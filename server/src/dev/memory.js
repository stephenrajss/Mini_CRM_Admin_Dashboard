import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';

const mongo = await MongoMemoryServer.create();
const uri = mongo.getUri('mini-crm');
const env = { ...process.env, MONGODB_URI: uri };

console.log(`Ephemeral MongoDB is running. Data is discarded when this process stops.`);

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${args.join(' ')} exited with code ${code}`));
    });
  });
}

await run(['src/seed/seed.js']);

const server = spawn(process.execPath, ['src/server.js'], { env, stdio: 'inherit' });

async function shutdown() {
  server.kill();
  await mongo.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
