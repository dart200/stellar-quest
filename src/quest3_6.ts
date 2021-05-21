#!/usr/bin/env ts-node-script
import {
  stellar, server, fundAccount,
  main, submit, newTxn,
} from './lib';
import {img} from './quest3_6_img';

main(async () => {
  /** quest account public/private key pair */
  const accSecret = 'SCJHVUYYT4FJSFCLFEZFAXMADB4WSWYMJJHFF77UOS5ZYBLDPFU7G7IO';    // series 3 quest 6
  const accKP = stellar.Keypair.fromSecret(accSecret);
  // const accKP = stellar.Keypair.random();

  console.log(accKP.publicKey());
  console.log(accKP.secret());

  await server.loadAccount(accKP.publicKey())
    .then(async () => {
      const randKP = stellar.Keypair.random();

      await fundAccount(randKP);
      const mergeTxn = (await newTxn(accKP))
        .addOperation(stellar.Operation.accountMerge({
          destination: randKP.publicKey(),
        }))
        .build();
      mergeTxn.sign(accKP);
      await submit(mergeTxn);

      await fundAccount(accKP);
    })
    .catch(async () => {
      await fundAccount(accKP);
    });
  console.log(
    await (await server.loadAccount(accKP.publicKey())).sequenceNumber()
  );

  const asset = new stellar.Asset('NFT', accKP.publicKey());

  const imgBuf: [string,string][] = [];
  let done = false;
  let rest = img;
  let num = 0;
  while (!done) {
    console.log(num, rest.length);

    const keyPrefix = num.toString().padStart(2, '0');
    let keyData = '';
    if (rest.length > 62) {
      keyData = rest.slice(0, 62);
      rest = rest.slice(62);
    }

    let val;
    if (rest) {
      val = rest.slice(0, 64);
      rest = rest.slice(64);
      if (!rest) {
        console.log('done on val');
        done = true;
      }
    } else {
      val='';
    }

    imgBuf.push([`${keyPrefix}${keyData}`, val]);
    num++;
  }

  let issueNftBuilder = (await newTxn(accKP));

  imgBuf.forEach(([key, val], i) => {
    console.log(i, key, val);
    issueNftBuilder = issueNftBuilder.addOperation(stellar.Operation.manageData({
      name: key,
      value: val,
    }))
  });
  
  const issueNftTxn = issueNftBuilder.addOperation(stellar.Operation.payment({
      source: accKP.publicKey(),
      asset,
      amount: '1',
      destination: accKP.publicKey(),
    }))
   .build();
  issueNftTxn.sign(accKP);
  await submit(issueNftTxn);

});