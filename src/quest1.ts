#!/usr/bin/env ts-node-script

import * as stellar from 'stellar-sdk';

// The source account is the account we will be signing and sending from.
const accSecret = 'SDQVFGQFE72ON7TOWEQJRCIHRZNZZTHFQS7NDRD56EWWJJSBSKVGQ2BA';

// Derive Keypair object and public key (that starts with a G) from the secret
const accKeyPair = stellar.Keypair.fromSecret(accSecret);
const accPubKey = accKeyPair.publicKey();

const destination = 'GB4LWIQJLDJATSG5276H5K6CLP7KCZDZFBOACDYRCUBYJ7TN6OYCWDLN';

console.log({accPubKey, destination});

// const server = new stellar.Server('https://horizon-testnet.stellar.org');

// stellar.Operation.createAccount({
//   destination,
//   startingBalance: '5000',
// })

