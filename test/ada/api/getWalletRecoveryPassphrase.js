const { expect } = require('chai');
const { getLedger, promptUser } = require('../utils');

describe('getWalletRecoveryPassphrase', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });
  
  it('Should successfully get recovery passphrase', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          promptUser('Please accept public key request');
          
          return ledger.getWalletRecoveryPassphrase();
        })
        .then((res) => {
          expect(res).to.have.property('publicKey');
          expect(res).to.have.property('chainCode');
          done();
        })
        .catch((error) => done(error));
    })
  
    it('Should return same public key and chain code with 3 consecutive calls', (done) => {
      let response = {};

      getLedger()
        .then((device) => {
          ledger = device;
          promptUser('Please accept public key request');
          
          return ledger.getWalletRecoveryPassphrase();
        })
        .then((res) => {
          expect(res).to.have.property('publicKey');
          expect(res).to.have.property('chainCode');
          response = res;
          promptUser('Please accept public key request');
          
          return ledger.getWalletRecoveryPassphrase();
        })
        .then((res) => {
          expect(res.publicKey).to.equal(response.publicKey);
          expect(res.chainCode).to.equal(response.chainCode);
          promptUser('Please accept public key request');

          return ledger.getWalletRecoveryPassphrase();
        })
        .then((res) => {
          expect(res.publicKey).to.equal(response.publicKey);
          expect(res.chainCode).to.equal(response.chainCode);
          done();
        })
        .catch((error) => done(error));
    })
});
