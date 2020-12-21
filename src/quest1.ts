#!/usr/bin/env ts-node-script
import {main, server, accPubKey, stellar, axios, hash256Str} from './lib';

const fundKP = stellar.Keypair.random();

main(async () => {
  await server.loadAccount(accPubKey)
    .then(() => {
      console.log('account already created');
      process.exit();
    })
    .catch(() => {});

  await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(fundKP.publicKey())}`)
    .then(resp => {
      console.log('funding account created');
    });

  const fundAcc = await server.loadAccount(fundKP.publicKey());
  fundAcc.balances.forEach(balance => {
    console.log('type:', balance.asset_type, ', balance:', balance.balance);
  });

  const fee = String(await server.fetchBaseFee());
  console.log('base fee:', fee);
  const txn = new stellar.TransactionBuilder(fundAcc, {
    fee,
    networkPassphrase: stellar.Networks.TESTNET,
  })
  .addOperation(stellar.Operation.createAccount({
    destination: accPubKey,
    startingBalance: '5000',
  }))
  .addMemo(stellar.Memo.hash(
    hash256Str('Stellar Quest Series 2')
  ))
  .setTimeout(30)
  .build();

  txn.sign(fundKP);

  console.log(txn.toEnvelope().toXDR('base64'));

  await server.submitTransaction(txn)
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(
        JSON.stringify(
          stellar.xdr.TransactionMeta.fromXDR(res.result_xdr, 'base64'))
      );
    })
});
