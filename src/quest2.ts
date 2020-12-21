#!/usr/bin/env ts-node-script
import {main, submit, server, accPubKey, stellar, accKeyPair} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);

  const fee = String(await server.fetchBaseFee());

  /** new asset I'm creating */
  const nickelodeon = new stellar.Asset('nickelodeon', accPubKey)

  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.changeTrust({
    asset: nickelodeon,
    limit: '1337',
  }))
  .addOperation(stellar.Operation.payment({
    asset: nickelodeon,
    amount: '420',
    destination: accPubKey,
  }))
  .setTimeout(15)
  .build();

  txn.sign(accKeyPair);

  await submit(txn);
});