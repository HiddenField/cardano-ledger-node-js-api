const { expect } = require('chai');
const { getLedger, promptUser, ifHeadlessIt } = require('../utils');

describe('getWalletPublicKeyWithIndex', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it('Should successfully get public key', (done) => {
    const index = 0xFFFFFFFF;

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then((res) => {
        const publicKey = Buffer.from(res.publicKey, 'hex');
        expect(publicKey.length).to.equal(32);
        done();
      })
      .catch((error) => done(error));
  });
  
  it('Should return same public key with same index consistently', (done) => {
    const index = 0xFEEDBEEF;
    let response = {};

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then((res) => {
        expect(res).to.have.property('publicKey');
        response = res;
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then((res) => {
        expect(res.publicKey).to.equal(response.publicKey);
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then((res) => {
        expect(res.publicKey).to.equal(response.publicKey);
        done();
      })
      .catch((error) => done(error));
  });

  it('Should successfully get public key for lowest hardened index (0x80000000)', (done) => {
    const index = 0x80000000;

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then((res) => {
        expect(res).to.have.property('publicKey');
        done();
      })
      .catch((error) => done(error));
  });

  it('Should not get first non-hardened index (0x7FFFFFFF)', (done) => {
    const index = 0x7FFFFFFF;

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept public key request');

        return ledger.getWalletPublicKeyWithIndex(index);
      })
      .then(res => done(res))
      .catch((error) => {
        expect(error).to.have.string('5201');
        done();
      });
  });

  it('Should reject invalid index', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.getWalletPublicKeyWithIndex('44\'1815\'');
      })
      .then(res => done(res))
      .catch((error) => {
        expect(error).to.have.string('5003');
        done();
      });
  });

  ifHeadlessIt('Should get public key 20 times (stress test)', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return Promise.all([...Array(20)].map(tx => ledger.getWalletPublicKeyWithIndex(0xBABADADA)));
      })
      .then((responses) => {
        responses.forEach((res) => {
          expect(res).to.have.property('publicKey');
        });
        done();
      })
      .catch(error => done(error));
  });
});
