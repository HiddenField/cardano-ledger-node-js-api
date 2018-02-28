## Using with Cardano SL

Create an application object after opening the device

```javascript
var ada = new ledger.ada(comm);

ada.getWalletPublicKeyWithIndex(0xC001CODE)
 .then((response) => {
   console.log(response.publicKey);
 })
 .catch(error => console.log(error));
```

See LedgerAda class for full API.

## Companion App

This api is compatible with the [Cardano Ledger App](https://github.com/HiddenField/ledger-cardano-app).

## Install and Setup

Node 6.11+ required. Suggest using a node version manager.

```
nvm 6.11.1 --lts
git clone [Project]
npm install
```

## Running examples

Only production API calls work in the current examples.

Uncomment example and run `node examples/node-ada.js`


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

## Generating JSDocs

`jsdoc -c src/ada/ada.jsdoc.conf.json`

## Troubleshooting

### Running production API

* `An error occurred:  No device found` :
Ledger not connected; VM still running (host doesn't have USB); Have not unlocked device

* `6e00`:App is not running on Ledger
* `6d00`:API is not present (wrong build on device for intended API)

### Running tests

* `AssertionError: expected 'Invalid status 6e00'` : App not running
* `npm ERR! Exit status 10` : Device not unlocked; Device not connected; VM still RUNNING
* `'Invalid status 6d00'` : You are running the mismatched tests vs build, e.g. running core tests against production build
* `Not all tests passing?` : You've broken something; running mismatched tests; not following test instructions, e.g. asked to reject transaction, but you approve.
