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
  describe('getWalletPublicKey_async', () => {
    it('Should get public key', (done) => { 
        getLedger()
          .then((ledger) => { 
            // TODO
            done();
          })
          .catch(error => done(error));
    });

    it('Should fail with incorrect path', (done) => { 
        getLedger()
          .then((ledger) => { 
            // TODO
            done();
          })
          .catch(error => done(error));
    });
  });
  
  describe('getRandomWalletPublicKey_async', () => { 
    // TODO
  });
  
  describe('getWalletPublicKeyFrom_async', () => {
    // TODO
  });
  
  describe('getWalletIndex_async', () => {
    // TODO
  });
  
  describe('signTransaction_async', () => {
    // TODO
  });
  
  describe('hashTransaction_async', () => {
    // TODO
  });
});
