#!/usr/bin/env ts-node-script
import * as stellar from 'stellar-sdk';
import * as crypto from 'crypto';
import axios from 'axios';

// My quest account
const accSecret = 'SDQVFGQFE72ON7TOWEQJRCIHRZNZZTHFQS7NDRD56EWWJJSBSKVGQ2BA';

/** quest account public/private key pair */
const accKeyPair = stellar.Keypair.fromSecret(accSecret);
const accPubKey = accKeyPair.publicKey();

/** server connection */
const server = new stellar.Server('https://horizon-testnet.stellar.org');

/** main */
const main = (func: () => any) => {
  console.log('running ...');
  const ret = func()
  if (ret instanceof Promise) {
    void ret
      .catch(err => {
        console.log(err.stack);
      })
      .then(() => process.exit())
  }
};

/** hash a string using SHA-256, return hex */
const hash256Str = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export {
  axios,
  main,
  hash256Str,
  stellar,
  accKeyPair,
  accPubKey,
  server,
};