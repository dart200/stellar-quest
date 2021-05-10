#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, moment,
} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);
  const newKeyPair = await stellar.Keypair.random();
  
  const fee = String(await server.fetchBaseFee()*10);
  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.beginSponsoringFutureReserves({
    sponsoredId: newKeyPair.publicKey(),
  }))
  .addOperation(stellar.Operation.createAccount({
    destination: newKeyPair.publicKey(),
    startingBalance: "0",
  }))
  .addOperation(stellar.Operation.endSponsoringFutureReserves({
    source: newKeyPair.publicKey(),
  }))
  .setTimeout(30)
  .build();
  txn.sign(accKeyPair, newKeyPair);

  await submit(txn);
});