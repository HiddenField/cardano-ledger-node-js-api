const Joi = require('joi');
const { expect } = require('chai');
const { getLedger, validate } = require('../utils');

describe('isConnected', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });
  
  it('Should correctly get semver version of device', (done) => {
    const schema = Joi.object().keys({
      success: Joi.boolean(),
      major: Joi.number().integer().min(0).required(),
      minor: Joi.number().integer().min(0).required(),
      patch: Joi.number().integer().min(0).required(),
    });

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.isConnected();
      })
      .then((res) => {
        validate(res, schema);
        done();
      })
      .catch(error => done(error));
  });
});
