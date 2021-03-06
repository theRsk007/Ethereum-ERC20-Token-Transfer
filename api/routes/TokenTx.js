const express = require('express');
const router = express.Router();

require('dotenv').config();
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const web3 = new Web3(process.env.INFURA_API);

const Transaction = require('../models/Transaction');

const account1 = process.env.account1; // Contract address link account number
const contractAddress = process.env.contractAddress; // contract address
const privateKey1 = Buffer.from(process.env.PRIVATE_KEY, 'hex'); // Contract address link account private key


router.get('/transaction', async (req, res, next) => {
    try {
        const { to, amount } = req.body;

        if (!(to && amount)){
            res.status(400).send('All input field is requried!');
        } else {
            const contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeSub","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeDiv","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeMul","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeAdd","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}]

            const contract = new web3.eth.Contract(contractABI, contractAddress);

            const data = contract.methods.transfer(to, amount).encodeABI()

            web3.eth.getTransactionCount(account1, (err, txCount) => {
            
                // Create transaction object
                const txObject = {
                    nonce: web3.utils.toHex(txCount),
                    gasLimit: web3.utils.toHex(800000),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                    to: contractAddress,
                    data: data
                }

                // Sign the transaction
                const tx = new Tx(txObject, { chain: 'ropsten' });
                tx.sign(privateKey1);

                const serializedTx = tx.serialize()
                const raw = '0x' + serializedTx.toString('hex');

                // Broadcast the transaction
                web3.eth.sendSignedTransaction(raw, (err, txHash) => {

                    const trans = new Transaction({
                        sender: account1,
                        receiver: to,
                        contractAddress: txObject.contractAddress,
                        amount:amount,
                        nonce:txObject.nonce,
                        gasLimit:txObject.gasLimit,
                        gasPrice:txObject.gasPrice,
                        txHash:txHash,
                    });

                    try {
                        const t1 = trans.save()
                        res.status(201).json({
                            Message: 'Transaction success...',
                            txHash: txHash
                        }); 
                    } catch (error) {
                        console.log('err:', err,);
                    }                   
                });
            });
        }
    } catch (error) {
        res.status(401).json({
            'Error' : error
        });
        console.log('Error :', error); 
    }
});

module.exports = router;
