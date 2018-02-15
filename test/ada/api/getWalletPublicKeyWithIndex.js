const { expect } = require('chai');
const { getLedger, promptUser } = require('../utils');

describe('getWalletPublicKeyWithIndex', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });
});