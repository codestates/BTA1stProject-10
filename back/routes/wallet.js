const express = require('express');
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require('fs');
const Bip39 = require('bip39');
const Hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');


const url = 'https://rpc.testnet.fantom.network'  // url string
const web3 = new Web3(new Web3.providers.HttpProvider(url));

// TODO : lightwallet 모듈을 사용하여 랜덤한 니모닉 코드를 얻습니다.
router.post("/newWallet", async (req, res) => {
    const { password } = req.body;
    try {
        console.log('password : ' + password);
        const mnemonic = Bip39.generateMnemonic();
        console.log(mnemonic);
        const seed = Bip39.mnemonicToSeedSync(mnemonic.toString());
        console.log(seed);
        const root = Hdkey.fromMasterSeed(Buffer.from(seed, 'hex'));
        
        //console.log(root);
        const addrNode = root.derive("m/44'/60'/0'/0/0");
        const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
        const addr = ethUtil.publicToAddress(pubKey).toString('hex');
        const publicAddress = ethUtil.toChecksumAddress(addr);
        console.log(publicAddress);
        const privateKey = ethUtil.bufferToHex(addrNode._privateKey);
        console.log(privateKey);
        console.log(password);
        const keystore = web3.eth.accounts.encrypt(privateKey, password.toString());
        //const keystore = Web3.eth.accounts.encrypt('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318', 'test!');

        return res.json({ privateKey, mnemonic, keystore});
        //return res.json({ privateKey, mnemonic });

    } catch (err) {
      console.log(err);
    }
});



module.exports = router;