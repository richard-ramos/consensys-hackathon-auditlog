import Web3 from 'web3'

let web3;

// Good practice, we could have already defined web3.
if (typeof web3 !== 'undefined') {
    // Use its provider.
    web3 = new Web3(web3.currentProvider);
} else {
    // Use IPC.
    web3 = new Web3(new Web3.providers.IpcProvider(
        process.env['HOME'] + '/.ethereum/net42/geth.ipc',
        require('net')));
}

export default web3;
