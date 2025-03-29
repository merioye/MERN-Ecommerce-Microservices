import { generateKeyPairSync } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

const root = resolve(__dirname, '..');

// Defining the key pair size (in bits)
const keyPairSize = 2048;

const keyPairType = 'rsa';
const keyEncoding = {
  type: 'pkcs1',
  format: 'pem',
};

// RSA key pair for access token
const { privateKey, publicKey } = generateKeyPairSync(keyPairType, {
  modulusLength: keyPairSize,
  publicKeyEncoding: keyEncoding,
  privateKeyEncoding: keyEncoding,
});

// Output folder path
const outputFolder = resolve(root, 'certs');

if (!existsSync(outputFolder)) {
  mkdirSync(outputFolder);
}

writeFileSync(resolve(outputFolder, 'private.pem'), privateKey);
writeFileSync(resolve(outputFolder, 'public.pem'), publicKey);
