#!/usr/bin/env ts-node-script
import {
  stellar, server, fundAccount,
  main, submit, newTxn,
} from './lib';

main(async () => {
  /** quest account public/private key pair */
  const accSecret = 'SCJRSVQFFD4XEEKESVKDV5UR3KLE4JVZRHDC3PGM44IQ2R3OWIHATMUG';    // series 3 quest 5
  const accKP = stellar.Keypair.fromSecret(accSecret);
  // const accKP = stellar.Keypair.random();

  console.log(accKP.publicKey());
  console.log(accKP.secret());

  await server.loadAccount(accKP.publicKey())
    // .then(() => {
    //   console.log('account already created');
    //   process.exit();
    // })
    .catch(async () => {
      await fundAccount(accKP);
    });
  console.log(
    await (await server.loadAccount(accKP.publicKey())).sequenceNumber()
  );

  const asset = new stellar.Asset('MariusLenk', accKP.publicKey());
  const badKP = stellar.Keypair.random();

  const issueAssetTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.payment({
      source: accKP.publicKey(),
      asset,
      amount: '42000000',
      destination: accKP.publicKey(),
    }))
    .addOperation(stellar.Operation.setOptions({
      setFlags: stellar.AuthRevocableFlag,
    }))
    .addOperation(stellar.Operation.setOptions({
      setFlags: stellar.AuthClawbackEnabledFlag,
    }))
    .addOperation(stellar.Operation.createAccount({
      startingBalance: '1000',
      destination: badKP.publicKey(),
    }))
    .addOperation(stellar.Operation.changeTrust({
      asset,
      source: badKP.publicKey(),
    }))
    .addOperation(stellar.Operation.payment({
      amount: '1000',
      asset,
      destination: badKP.publicKey(),
    }))
    .build();
  issueAssetTxn.sign(accKP);
  issueAssetTxn.sign(badKP);
  await submit(issueAssetTxn);

  const clawbackTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.clawback({
      amount: '420',
      asset,
      from: badKP.publicKey(),
    }))
    .build();
  clawbackTxn.sign(accKP);
  await submit(clawbackTxn);
});