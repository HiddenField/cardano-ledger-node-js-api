## Using with Cardano SL

Create an application object after opening the device

```javascript
var ada = new ledger.ada(comm);
```

You can retrieve a public key and chain code given its BIP 32 path

```javascript
ada.getWalletPublicKey_async("44'/1815'/0'/0'/0'").then(
     function(result) { console.log(result);}).fail(
     function(error) { console.log(error); });
```

You can retrieve a random address' public key and chain code.
This equates to "44'/1815'/[Wallet Index]'/0'/[Random_Index]'"

```javascript
ada.getRandomWalletPublicKey_async().then(
				 function(result) { console.log(result);}).fail(
				 function(error) { console.log(error); });
```

Or instead, you can pass in the address' index
This would equate to "44'/1815'/[Wallet Index]'/0'/[Input_Address]'"

```javascript
var index = 0xFFFFFFFF;

ada.getWalletPublicKeyFrom_async(index).then(
				 function(result) { console.log(result);}).fail(
				 function(error) { console.log(error); });
```

You can request the Wallet's Index

```javascript
ada.getWalletIndex_async().then(
					function(result) { console.log(result);}).fail(
					function(error) { console.log(error); });
```

## Building & Running Examples - Cardano SL

Node 6.11+ required. Suggest using a node version manager.

```
nvm 6.11.1 --lts
git clone [Project]
npm install
```

Building for Electron

```
npm install --save electron-builder
./node_modules/.bin/electron-builder
npm install
```

Changes required for Electron detection in LedgerCo node module - NOT PULLED

src/index.js:

```javascript
    var isElectron = (window && window.process && window.process.type);
    ...
    if (isNode || isElectron) ledger.comm_node = require('./ledger-comm-node');
```
## Testing Cardano SL

End-to-end tests are provided for both core functionality and the public API.


### Core Tests

First, ensure you have a **test** build installed on the device (see ledger app respository for details). Then run:

```bash
npm run ada-core-test
```

### API Tests

These tests can be run with or without device interaction (headlessly).

For tests which require user interaction, ensure you have a standard production build on the device, and run:

```bash
npm run ada-api-test
```

For headless tests, ensure you have a **headless** build on the device and run:

```bash
# Note the -- which is required to pass through arguments
npm run ada-api-test -- --headless
```

This will suppress any additional prompts, for reduced verbosity.

## Notes for Cardano SL

The address derivation method only allows hardened address derivation, i.e. the indexes must be > 0x80000000.
Using indexes lower than 0x80000000 will hang the ledger application.
