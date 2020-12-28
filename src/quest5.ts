#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, moment,
} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);
  
  const fee = String(await server.fetchBaseFee()*10);
  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.claimClaimableBalance({
    balanceId: '00000000bae64b714bcb99b2115741fa88712ad2f22071efed9b3afcbece3624d2579b3b',
  }))
  .setTimeout(30)
  .build();
  txn.sign(accKeyPair);

  await submit(txn);
});