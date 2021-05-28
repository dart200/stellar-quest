#!/usr/bin/env ts-node-script
import {
  stellar, server, fundAccount, loadTestAccount,
  main, submit, newTxn, axios, addPostDataOps,
} from './lib';

main(async () => {
  /** quest account public/private key pair */
  let questKP: stellar.Keypair | undefined;

  // questKP = stellar.Keypair.fromSecret(
  //   'SB5QZT5T2TASNERIBLUHB7GZM3QNIPGVPJ77S27AWRDRLNUFH4RGZF3S'
  // );

  const accKP = await loadTestAccount(questKP);
  console.log(accKP.publicKey(), accKP.secret());

  // can get WEB_AUTH_ENDPOINT from here:
  // const res = await axios.get('https://testanchor.stellar.org/.well-known/stellar.toml');
  // console.log(res.data);
  const WEB_AUTH_ENDPOINT = "https://testanchor.stellar.org/auth";

  // get unsigned challenge
  const {transaction: unsigned, network_passphrase} 
    = (await axios.get(WEB_AUTH_ENDPOINT+`?account=${accKP.publicKey()}`)).data;

  // sign challenge
  const signedTxn = new stellar.Transaction(unsigned, network_passphrase);
  signedTxn.sign(accKP);
  
  // submit and get JWT
  const jwtToken = (
    await axios.post(WEB_AUTH_ENDPOINT, {transaction: signedTxn.toXDR()})
  ).data.token as string;
  console.log(jwtToken);

  // build transaction to post JWT to network 
  // (unsafe, do not do in real conditions)
  const postJwtBuilder = await newTxn(accKP);
  addPostDataOps(jwtToken, postJwtBuilder);

  const postJwtTxn = postJwtBuilder.build();
  postJwtTxn.sign(accKP);
  await submit(postJwtTxn);``
});