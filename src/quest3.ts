#!/usr/bin/env ts-node-script
import {
  stellar, server, accPubKey, accKeyPair,
  main, submit, createFunds,
} from './lib';

main(async () => {
  const account = await server.loadAccount(accPubKey);
  const feeKeyPair = await createFunds();
  const destKeyPair = stellar.Keypair.random();
  
  const fee = String(await server.fetchBaseFee()*10);
  const innerTxn = new stellar.TransactionBuilder(account, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.createAccount({
    destination: destKeyPair.publicKey(),
    startingBalance: '13.37',
  }))
  .setTimeout(30)
  .build();
  innerTxn.sign(accKeyPair);

  const feeBumpTxn = stellar.TransactionBuilder.buildFeeBumpTransaction(
    feeKeyPair, fee, innerTxn, stellar.Networks.TESTNET,
  );
  feeBumpTxn.sign(feeKeyPair);

  console.log(feeBumpTxn.toXDR());
  await submit(feeBumpTxn);
});