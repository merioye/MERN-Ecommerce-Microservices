import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

const root = resolve(__dirname, '..');

const privatePemKey = readFileSync(resolve(root, 'certs', 'private.pem'));

// Converting private pem key to jwk and only get public part of the jwk
const publicJwk = rsaPemToJwk(privatePemKey, { use: 'sig' }, 'public');

// Output folder path
const outputFolder = resolve(root, 'public', '.well-known');

if (!existsSync(outputFolder)) {
  mkdirSync(outputFolder, { recursive: true });
}

// Json-web-keys-set
const jwks = {
  keys: [publicJwk],
};

writeFileSync(resolve(outputFolder, 'jwks.json'), JSON.stringify(jwks));
