var ProviderEngine = require("web3-provider-engine");
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");

var engine = new ProviderEngine();
engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new FiltersSubprovider());
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider("https://rinkeby.infura.io/M6ZZKsf1MORH8hXk8JWH")));
engine.start(); 

module.exports = {
  networks: {
    test: {
      network_id: 4,
      provider: engine,
      from: address
    }
  }
};


