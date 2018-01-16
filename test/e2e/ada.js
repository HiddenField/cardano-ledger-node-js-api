const { comm_node, ada } = require('../../src');
const { expect } = require('chai');

/**
 * Convenience promisified function for retrieving the ADA Ledger.
 *
 * @returns {Promise<Object>} A promise that contains the ledger when fulfilled.
 */
function getLedger() {
  return new Promise((resolve, reject) => {
    return comm_node.create_async()
      .then(comm => new ada(comm))
      .then(ledger => resolve(ledger))
      .catch(error => reject(error));
  });
}

describe('Cardano ADA', () => {
  it('getWalletPublicKey_async', (done) => { 
      getLedger()
        .then((ledger) => { 
          // TODO
          done();
        })
        .catch(error => done(error));
  });
  
  it.skip('getRandomWalletPublicKey_async', (done) => { 
    // TODO
  });
  
  it.skip('getWalletPublicKeyFrom_async', (done) => {
    // TODO
  });
  
  it.skip('getWalletIndex_async', (done) => {
    // TODO
  });
  
  it.skip('signTransaction_async', (done) => {
    // TODO
  });
  
  it.skip('hashTransaction_async', (done) => {
    // TODO
  });
});
