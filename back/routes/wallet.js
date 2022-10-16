const express = require('express');
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require('fs');
const Bip39 = require('bip39');
const Hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

const url = 'https://rpc.testnet.fantom.network'  // url string
const web3 = new Web3(new Web3.providers.HttpProvider(url));

// TODO : newWallet : password를 통하여 wallet 생성
router.post("/newWallet", async (req, res) => {
    const { password } = req.body;
    try {
        console.log('password : ' + password);
        const mnemonic = Bip39.generateMnemonic();
        console.log(mnemonic);
        const seed = Bip39.mnemonicToSeedSync(mnemonic.toString());
        //console.log(seed);
        const root = Hdkey.fromMasterSeed(Buffer.from(seed, 'hex'));
        
        //console.log(root);
        const addrNode = root.derive("m/44'/60'/0'/0/0");
        const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        const addr = ethUtil.publicToAddress(pubKey).toString('hex');
        const publicAddress = ethUtil.toChecksumAddress(addr);
        console.log(publicAddress);
        const privateKey = ethUtil.bufferToHex(addrNode._privateKey);
        console.log(privateKey);
        //console.log(password);
        const keystore = web3.eth.accounts.encrypt(privateKey, password.toString());
        //const keystore = Web3.eth.accounts.encrypt('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318', 'test!');

        return res.json({ privateKey, mnemonic, keystore});
        //return res.json({ privateKey, mnemonic });

    } catch (err) {
      console.log(err);
    }
});


// TODO : getBalance : Public Address 로 잔고 조회
router.post("/getBalance", async (req, res) => {
  const { address } = req.body;
  try {
      console.log(address);
      const balance = await web3.eth.getBalance(address);
      console.log(balance);
      return res.json(balance);
  } catch (err) {
    console.log(err);
  }
});


// TODO : sendTransaction 
router.post("/sendTransaction", async (req, res) => {
  //const { privateKey, fromAddress, toAddress, amount } = req.body;
  try {

    //const privateKey = Buffer.from('7d0c8ef98351641b54de0c0729019c4ab6d04478bb2288701d77bcc4342c42b6', 'hex');
    const privateKey = '7d0c8ef98351641b54de0c0729019c4ab6d04478bb2288701d77bcc4342c42b6';

    const account1 = '0x42cd61efEb226A4bc7Ac449CF9af5Bf85634e432';

    const account2 = '0xafc0eb1c10e32d9286321bde09592d7db8e8c6a1';

    const nonce = await web3.eth.getTransactionCount(account1);
    console.log(nonce);
    const gasPrice = await web3.eth.getGasPrice();
    console.log(gasPrice)
  
    const bal = await web3.eth.getBalance(account1);
  
    console.log(bal)
  
    const rawTx = {
      from: account1,
      to: account2,
      value: Web3.utils.toHex(Web3.utils.toWei('1')),
      //gasLimit: Web3.utils.toHex(210000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001')),
      gas: Web3.utils.toHex(21000),
      nonce: Web3.utils.toHex(nonce),

    };
  
    web3.eth.accounts.signTransaction(rawTx, privateKey)
    .then(function(value){
        web3.eth.sendSignedTransaction(value.rawTransaction)
        .then(function(response){
          console.log("response:" + JSON.stringify(response, null, ' '));
        })
      })
    /*
    const tx = new Tx(rawTx);
    tx.sign(privateKeyBuffer);
    const serializedTx = tx.serialize();
  
    console.log(tx.getSenderAddress().toString('hex'))
  
    const res = await web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`);
    console.log(res)
    */
    return res;


    /*
    web3.eth.getTransactionCount(account1, (err, txCount) => { 

        const txObject = { 
        
        nonce: web3.utils.toHex(txCount), 
        
        to: account2, 
        
        value: web3.utils.toHex(web3.utils.toWei('100000', 'wei')), 
        
        gasLimit: web3.utils.toHex(21000), 
        
        gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'wei')),
        chainID: '4002' 
        }; 



        console.log(txObject);

        const tx = new Tx(txObject);
        
        tx.sign(privateKey);

        const serializedTx = tx.serialize();

       //const raw = '0x' + serializedTx.toString('hex'); 
       const raw = serializedTx.toString('hex'); 
       console.log(raw);
        

        web3.eth.sendSignedTransaction(raw, (err, txHash) => { 

        console.log('txHash:', txHash); 
        })  

    })
    */

  } catch (err) {
    console.log(err);
  }
});

module.exports = router;