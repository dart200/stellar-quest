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
  .addOperation(stellar.Operation.payment({
    amount: '100',
    asset: stellar.Asset.native(),
    destination: sponsoredAccKey,
  }))
  .addOperation(stellar.Operation.revokeAccountSponsorship({
    account: sponsoredAccKey,
  }))
  .setTimeout(30)
  .build();
  txn.sign(accKeyPair);

  await submit(txn);
});