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
    .catch(async () => {
      await fundAccount(accKP);
    });

  const randKP = stellar.Keypair.random();
  await fundAccount(randKP);
  const asset = new stellar.Asset('NFT', accKP.publicKey());

  const imgSlices: [string,string | null][] = [];
  let rest: string | Buffer = base64_encode('./quest3_6_img.png');
  let num = 0;
  while (rest.length) {
    const keyPrefix = num.toString().padStart(2, '0');
    const keyData = rest.slice(0, 62);
    rest = rest.slice(62);

    const val = rest.length ? rest.slice(0, 64) : '';
    rest = rest.slice(64);

    imgSlices.push([`${keyPrefix}${keyData}`, val]);
    num++;
  }

  let issueNftBuilder = (await newTxn(accKP));

  imgSlices.forEach(([key, val], i) => {
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