#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, moment,
} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);
  const sponsoredAccKey = 'GA3G65RLIOSGGFHSFTG6Z425PMU5DLPEKYZU4RZXLHEDXGT6BVXEWF23';
  
  const fee = String(await server.fetchBaseFee()*10);
  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(
    stellar.Operation.setOptions({
      homeDomain: "assets.muva.app",
    }),
  )
  .setTimeout(30)
  .build();
  txn.sign(accKeyPair);

  await submit(txn);
});