#!/usr/bin/env ts-node-script
import {
  stellar, server, getFee, hash256Str, fundAccount,
  main, submit, newTxn,
} from './lib';

main(async () => {
  /** quest account public/private key pair */
  const accSecret = 'SDWZ4RLEZ5J35E6NUIFUEBQGJR57CAAO2RKTLKDIAMRENWZGAZWYI6C4';    // series 3 quest 3
  const accKP = stellar.Keypair.fromSecret(accSecret);
  // const accPubKey = accKP.publicKey();
  // const accKP = stellar.Keypair.random();

  await server.loadAccount(accKP.publicKey())
    // .then(() => {
    //   console.log('account already created');
    //   process.exit();
    // })
    .catch(async () => {
      await fundAccount(accKP);
    });

  const preImage = "KanayeNet";
  const sha256Hash = hash256Str(preImage);
  console.log(preImage)
  console.log(sha256Hash)
  console.log(sha256Hash.length)

  const addSignerTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.setOptions({
      signer: {
        sha256Hash,
        weight: 1,
      },
    }))
    .build();
  addSignerTxn.sign(accKP);
  await submit(addSignerTxn);

  const removeSignerTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.setOptions({
      signer: {
        sha256Hash,
        weight: 0,
      },
    }))
    .build();
  removeSignerTxn.signHashX('4b616e6179654e6574');
  await submit(removeSignerTxn);

  console.log(accKP.publicKey());
  console.log(accKP.secret());
});