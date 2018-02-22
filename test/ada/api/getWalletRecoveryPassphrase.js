const { expect } = require('chai');
const Joi = require('joi');
const { getLedger, validate, promptUser, ifHeadlessIt } = require('../utils');

describe('getWalletRecoveryPassphrase', () => {
  let ledger = {};

  const schema = Joi.object().keys({
    success: Joi.boolean(),
    publicKey: Joi.string().regex(/^[a-zA-Z0-9]+$/).required(),
    chainCode: Joi.string().regex(/^[a-zA-Z0-9]+$/).required(),
  });

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
        const publicKey = Buffer.from(res.publicKey, 'hex');
        const chainCode = Buffer.from(res.chainCode, 'hex');

        validate(res, schema);
        expect(publicKey.length).to.equal(32);
        expect(chainCode.length).to.equal(32);
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
        validate(res, schema);
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
          validate(res, schema);
        });
        done();
      })
      .catch(error => done(error));
  });
});
