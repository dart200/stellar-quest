#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, createFunds,
} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);
  const fee = String(await server.fetchBaseFee()*10);

  const issAccKeyPair = await createFunds();

  /** new asset I'm creating */
  const nickelodeon = new stellar.Asset('nickelodeon', issAccKeyPair.publicKey());

  const txn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
    memo: stellar.Memo.text('nick'),
  })
  .addOperation(stellar.Operation.changeTrust({
    asset: nickelodeon,
  }))
  .addOperation(stellar.Operation.payment({
    source: issAccKeyPair.publicKey(),
    asset: nickelodeon,
    amount: '420',
    destination: accPubKey,
  }))
  .setTimeout(60)
  .build();

  txn.sign(accKeyPair,issAccKeyPair);

  // return server.submitTransaction(txn)
  //   .then(res => {
  //     console.log(JSON.stringify(res,null,2));
  //     console.log('\nSuccess! View the transaction at: ');
  //     console.log(
  //       JSON.stringify(
  //         stellar.xdr.TransactionResult.fromXDR(res.result_xdr, 'base64'))
  //     );
  //   })
  console.log(txn.toEnvelope().toXDR('base64'));
  await submit(txn);
});