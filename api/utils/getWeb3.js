import Web3 from 'web3'

var provider = new Web3.providers.HttpProvider('http://localhost:8545')
let web3I =  new Web3(provider);
export default web3I;
