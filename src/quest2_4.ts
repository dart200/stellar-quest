#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, moment,
} from './lib';

const toSoon = moment('Dec 28 2020, 22:00 PST');

main(async () => {
  const account = await server.loadAccount(accPubKey);

  
  const fee = String(await server.fetchBaseFee()*10);
  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.createClaimableBalance({
    amount: '100',
    asset: stellar.Asset.native(),
    claimants: [
      new stellar.Claimant(accPubKey,
        stellar.Claimant.predicateNot(
          stellar.Claimant.predicateBeforeAbsoluteTime(String(toSoon.unix()))
        ),
      ),
    ],
  }))
  .setTimeout(30)
  .build();
  txn.sign(accKeyPair);

  await submit(txn);
});