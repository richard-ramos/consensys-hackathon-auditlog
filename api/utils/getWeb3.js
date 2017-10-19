import Web3 from 'web3'

let web3 = new Web3(new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/M6ZZKsf1MORH8hXk8JWH',
        require('net')));

export default web3;
