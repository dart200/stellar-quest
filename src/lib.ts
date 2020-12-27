#!/usr/bin/env ts-node-script
import * as moment from 'moment';
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

const pretty = (obj: object) => {
  return JSON.stringify(obj, null, 2);
}

/** main */
const main = (func: () => Promise<any>) => {
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

type TxnParam = Parameters<typeof server.submitTransaction>[0];
/** normal submit routine */
const submit = (txn: TxnParam) => {
  console.log('submitting ...');
  return server.submitTransaction(txn)
    .then(res => {
      console.log(JSON.stringify(res,null,2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(
        JSON.stringify(
          stellar.xdr.TransactionResult.fromXDR(res.result_xdr, 'base64'))
      );
    })
    .catch(err => {
      console.log(pretty(err));
      console.log(err.stack);
    })
};

const createFunds = async () => {
  const fundKeyPair = stellar.Keypair.random();

  await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(fundKeyPair.publicKey())}`)
    .then(resp => {
      console.log('funding account created');
    });

  return fundKeyPair;
};

/** hash a string using SHA-256, return hex */
const hash256Str = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export {
  moment,
  axios,
  main,
  submit,
  createFunds,
  hash256Str,
  stellar,
  accKeyPair,
  accPubKey,
  server,
};