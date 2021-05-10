#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair, getFee, hash256Str, createFunds, newTxn,
  main, submit,
} from './lib';

main(async () => {

  const accSecret = 'SATVPVUC7S44FJZ245U7GW2DE3NQ7DOMRXYBAETN3FS5S53MW25TGTSA';    // series 3 quest 1
  const accKP = stellar.Keypair.fromSecret(accSecret);

  const fundKP = await createFunds();

  const mergeTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.accountMerge({
      source: accPubKey,
      destination: fundKP.publicKey(),
    }))
    .build();
  mergeTxn.sign(accKP)
  mergeTxn.toEnvelope().toXDR('base64');
  await submit(mergeTxn);

  const createTxn = (await newTxn(fundKP))
    .addOperation(stellar.Operation.createAccount({
      destination: accPubKey,
      startingBalance: '5000',
    }))
    .addOperation(stellar.Operation.bumpSequence({
      bumpTo: '110101115104111',
      source: accPubKey,
    }))
    .build();
  createTxn.sign(fundKP);
  createTxn.sign(accKP);
  await submit(createTxn);

  // const account2 = await server.loadAccount(accPubKey);
  // const bumpTxn = new stellar.TransactionBuilder(account2, {
  //   fee,
  //   networkPassphrase: stellar.Networks.TESTNET,
  // })
  // .addOperation(stellar.Operation.bumpSequence({
  //   bumpTo: String(Number(account2.sequenceNumber()) + 10),
  // }))
  // .setTimeout(30)
  // .build();
  // bumpTxn.sign(accKeyPair);
  // await submit(bumpTxn);
});