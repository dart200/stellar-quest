#!/usr/bin/env ts-node-script
import {
  stellar, server, getFee, hash256Str, createFunds,
  main, submit, newTxn,
} from './lib';

main(async () => {
  const fee = await getFee();

  // const sponsoredAccKey = 'GA3G65RLIOSGGFHSFTG6Z425PMU5DLPEKYZU4RZXLHEDXGT6BVXEWF23';

  /** quest account public/private key pair */
  const accSecret = 'SBLFVYYVW3WAD7HTANFG67UT3KPPBMWAXPGOWUQEOP5LSN52QUVB3R4G';    // series 3 quest 2
  const accKP = stellar.Keypair.fromSecret(accSecret);

  // await server.loadAccount(accKP.publicKey())
  //   .then(() => {
  //     console.log('account already created');
  //     process.exit();
  //   })
  //   .catch(() => {});

  // const fundKP = await createFunds();
  // const fundAcc = await server.loadAccount(fundKP.publicKey());

  // const createTxn = new stellar.TransactionBuilder(fundAcc, {
  //   fee,
  //   networkPassphrase: stellar.Networks.TESTNET,
  // })
  // .addOperation(stellar.Operation.createAccount({
  //   destination: accPubKey,
  //   startingBalance: '5000',
  // }))
  // .setTimeout(30)
  // .build();
  // createTxn.sign(fundKP);
  // await submit(createTxn);

  // const account = await server.loadAccount(accPubKey);
  // let builder 
  //   = new stellar.TransactionBuilder(account, {
  //     fee,
  //     networkPassphrase: stellar.Networks.TESTNET,
  //   })
  //   .setTimeout(30)

  let builder = await newTxn(accKP);

  for (let i = 0; i < 100; i++) {
    builder 
      = builder.addOperation(stellar.Operation.createAccount({
        startingBalance: '2',
        destination: stellar.Keypair.random().publicKey(),
      }));
  }

  const txn = builder.build();
  txn.sign(accKP)
  txn.toEnvelope().toXDR('base64');
  await submit(txn);
});