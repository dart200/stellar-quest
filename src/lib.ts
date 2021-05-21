#!/usr/bin/env ts-node-script
import * as moment from 'moment';
import * as stellar from 'stellar-sdk';
import * as crypto from 'crypto';
import axios from 'axios';

// My quest account
// const accSecret = 'SDQVFGQFE72ON7TOWEQJRCIHRZNZZTHFQS7NDRD56EWWJJSBSKVGQ2BA'; // series 2
const accSecret = 'SATVPVUC7S44FJZ245U7GW2DE3NQ7DOMRXYBAETN3FS5S53MW25TGTSA';    // series 3

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

const fundAccount = async (destKeyPair: stellar.Keypair) => {
  const destKP = destKeyPair || stellar.Keypair.random();

  await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(destKP.publicKey())}`)
    .then(resp => {
      console.log('funding account created');
    });

  return destKP;
};

const createFunds = () => fundAccount(stellar.Keypair.random())

const getFee = async () => {
  return String((await server.fetchBaseFee())*10000);
};

const newTxn = async (keypair:stellar.Keypair, incSequence:number = 0) => {
  const fee = await getFee();
  const accRsp = await server.loadAccount(keypair.publicKey());
  const acc = new stellar.Account(
    accRsp.accountId(), 
    String(Number(accRsp.sequenceNumber()) + incSequence)
  );
  console.log('creating txn with seq', acc.sequenceNumber());
  const txn = new stellar.TransactionBuilder(acc, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  }).setTimeout(30)

  return txn;
};

type TxnParam = Parameters<typeof server.submitTransaction>[0];
/** normal submit routine */
const submit = (txn: TxnParam) => {
  console.log('submitting ...', );
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
      console.log(err.response.data);
      throw new Error('txn failed');
    })
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
  fundAccount,
  getFee,
  newTxn,
  hash256Str,
  stellar,
  accKeyPair,
  accPubKey,
  server,
};