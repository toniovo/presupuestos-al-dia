import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';

const page = await readFile('web/index.html', 'utf8');
const handler = await readFile('worker/handler.js', 'utf8');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/worker.js', `const page = ${JSON.stringify(page)};\n${handler}`);
console.log('Worker listo en dist/worker.js');
