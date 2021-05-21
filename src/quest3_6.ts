#!/usr/bin/env ts-node-script
import {
  stellar, server, fundAccount,
  main, submit, newTxn,
} from './lib';
import * as fs from 'fs';

// function to encode file data to base64 encoded string
const base64_encode = (file) => {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
}

main(async () => {
  /** quest account public/private key pair */
  const accSecret = 'SCJHVUYYT4FJSFCLFEZFAXMADB4WSWYMJJHFF77UOS5ZYBLDPFU7G7IO';    // series 3 quest 6
  const accKP = stellar.Keypair.fromSecret(accSecret);
  // const accKP = stellar.Keypair.random();

  console.log(accKP.publicKey());
  console.log(accKP.secret());

  await server.loadAccount(accKP.publicKey())
    // .then(async () => {
    //   const randKP = stellar.Keypair.random();

    //   await fundAccount(randKP);
    //   const mergeTxn = (await newTxn(accKP))
    //     .addOperation(stellar.Operation.accountMerge({
    //       destination: randKP.publicKey(),
    //     }))
    //     .build();
    //   mergeTxn.sign(accKP);
    //   await submit(mergeTxn);

    //   await fundAccount(accKP);
    // })
    .catch(async () => {
      await fundAccount(accKP);
    });

  const randKP = stellar.Keypair.random();
  await fundAccount(randKP);

  const asset = new stellar.Asset('NFT', accKP.publicKey());

  const imgBuf: [string,string | null][] = [];
  let done = false;
  let rest: string | Buffer = base64_encode('./quest3_6_img.png');
  let num = 0;
  while (rest.length) {
    console.log(num, rest.length);

    const keyPrefix = num.toString().padStart(2, '0');
    let keyData = rest.slice(0, 62);
    rest = rest.slice(62);

    let val = '';
    if (rest.length) {
      val = rest.slice(0, 64);
      rest = rest.slice(64);
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
  
  const issueNftTxn = issueNftBuilder
    .addOperation(stellar.Operation.changeTrust({
      asset,
      limit: '1',
      source: randKP.publicKey(),
    }))
    .addOperation(stellar.Operation.payment({
      source: accKP.publicKey(),
      asset,
      amount: '1',
      destination: randKP.publicKey(),
    }))
   .build();
  issueNftTxn.sign(accKP);
  issueNftTxn.sign(randKP);
  await submit(issueNftTxn);

});

// 00iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAgAElEQVR4nG2beY: eGxWMTdmUCtmZWM5ZTMxbDdWMWF1ckYzZTM5M1U4ZzJNWXcyUTBNNEprZ0JBbEVuK0ZDRVdKa2lnUlNoUnBwQw==
// 00iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAgAElEQVR4nG2beY:  xlV17fP+fec9e31l7V1aurF3e393U8g2MYw2Q0M4JkgBAlEn+FCEWJkigRShRppC