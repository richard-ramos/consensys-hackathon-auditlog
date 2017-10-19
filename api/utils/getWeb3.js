import Web3 from 'web3'

let web3 = new Web3('http://localhost:8545');

var TestRPC = require("ethereumjs-testrpc");
web3.setProvider(TestRPC.provider());

export default web3;
