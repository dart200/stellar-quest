#!/usr/bin/env ts-node-script
import {
  stellar, server, fundAccount, loadTestAccount,
  main, submit, newTxn, axios, addPostDataOps,
} from './lib';

main(async () => {
  /** quest account public/private key pair */
  let questKP: stellar.Keypair | undefined;

  // eslint-disable-next-line prefer-const
  questKP = stellar.Keypair.fromSecret(
    'SCHJ3X2TWWWIVILDNQFAILLTH5DNG26QQ6WP4JMKHJRNHRQISECLOMLP'
  );

  const accKP = await loadTestAccount(questKP);
  console.log(accKP.publicKey(), accKP.secret());

  // submit trust txn
  const ASSET_CODE = 'MULT';
  const ASSET_ISS = 'GDLD3SOLYJTBEAK5IU4LDS44UMBND262IXPJB3LDHXOZ3S2QQRD5FSMM';
  const trustTxn = (await newTxn(accKP))
    .addOperation(stellar.Operation.changeTrust({
      asset: new stellar.Asset(ASSET_CODE, ASSET_ISS),
    }))
    .build();
  trustTxn.sign(accKP);
  await submit(trustTxn);

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

  const KYC_SERVER = "https://testanchor.stellar.org/kyc"

  await axios.put(`${KYC_SERVER}/customer`, {
    account: accKP.publicKey(),
    first_name: 'Nick',
    last_name: 'Sweeney',
    email_address: 'nick@sweeney.com',
    bank_number: '001122',
    bank_account_number: '6942969',
    type: 'bank_account',
  },{
    headers: {
      Authorization: 'Bearer ' + jwtToken,
    },
  }).catch(res => {
    return res.response;
  }).then(({data, status}) => {
    console.log('kyc:', status);
    console.log(data);
  });

  const TRANSFER_SERVER = "https://testanchor.stellar.org/sep6";

  // asset_code: ASSET_CODE,
  //     account: accKP.publicKey(),

  let depositId;
  await axios.get(`${TRANSFER_SERVER}/deposit`, {
    headers: {
      Authorization: 'Bearer ' + jwtToken,
    },
    params: {
      asset_code: ASSET_CODE,
      account: accKP.publicKey(),
      amount: 100,
      type: 'bank_account',
    },
  }).catch(res => {
    return res.response;
  }).then(({data, status}) => {
    console.log('deposit:', status);
    console.log(data);
    depositId = data.id;
  });

  await axios.get(`${TRANSFER_SERVER}/transaction`, {
    headers: {
      Authorization: 'Bearer ' + jwtToken,
    },
    params: {
      id: depositId,
    },
  }).catch(res => {
    return res.response;
  }).then(({data, status}) => {
    console.log('txn:', status);
    console.log(data);
  });
});

// TODO:
// lookup auto promisify
// lookup better axios without promise rejections