#!/usr/bin/env ts-node-script
import {
  stellar, server, hash256Str, fundAccount,
  main, submit, newTxn,
} from './lib';

main(async () => {
  /** quest account public/private key pair */
  const accSecret = 'SAWQTDQXS27A7J2BWWSCP5YI7ZC2N24IPXKSR4OQIKUWS24HTHPZE3UE';    // series 3 quest 3
  const accKP = stellar.Keypair.fromSecret(accSecret);
  // const accKP = stellar.Keypair.random();

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

  const preSignedTxn = (await newTxn(accKP, 1))
    .addOperation(stellar.Operation.createAccount({
      startingBalance: '420',
      destination: stellar.Keypair.random().publicKey(),
    }))
    .build();

  // const preImage = preSignedTxn.toEnvelope().toXDR('base64');
  // const sha256Hash = hash256Str(preImage);
  // console.log(preImage)
  // console.log(sha256Hash)
  // console.log(sha256Hash.length)

  const preAuthTx = preSignedTxn.hash().toString('hex');

  console.log(preAuthTx);

  const addSignerTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.setOptions({
      signer: {
        preAuthTx,
        weight: 1,
      },
    }))
    .build();
  addSignerTxn.sign(accKP);
  await submit(addSignerTxn);

  await submit(preSignedTxn);

  console.log(accKP.publicKey());
  console.log(accKP.secret());
});