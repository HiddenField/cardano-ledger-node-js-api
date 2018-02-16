const { expect } = require('chai');
const { getLedger, promptUser, ifHeadlessIt } = require('../utils');

describe('getWalletRecoveryPassphrase', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it('Should successfully get public key and chain code', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept public key request');

        return ledger.getWalletRecoveryPassphrase();
      })
      .then((res) => {
        expect(res.publicKey).to.have.lengthOf(64);
        expect(res.chainCode).to.have.lengthOf(64);
        done();
      })
      .catch((error) => done(error));
  });

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
  });

  ifHeadlessIt('Should get public key and chain code 20 times (stress test)', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return Promise.all([...Array(20)].map(tx => ledger.getWalletRecoveryPassphrase()));
      })
      .then((responses) => {
        responses.forEach((res) => {
          expect(res).to.have.property('publicKey');
          expect(res).to.have.property('chainCode');
        });
        done();
      })
      .catch(error => done(error));
  });
});
