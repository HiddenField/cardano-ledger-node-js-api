const { expect } = require('chai');
const { getLedger } = require('../utils');

describe('testHashTransaction', () => {
  let legder = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it('Should successfully hash transaction (168)', (done) => {
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9b63fc010c06fbe92cf6f820587406534795958c411e662dc014443c0688e001a6768cc86';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[1].tx).to.equal('40eaf5b817d73e4c239caf6b11c554fcb58a77e7a7f8635e4e1d5900cc3ae947');
        done();
      })
      .catch(error => done(error));
  });

  it('Should successfully hash transaction (96)', (done) => {
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[0].tx).to.equal('024f31a0066a074ffcda394cddf03bad743230a19917dfd60a77ac9d25e63a49');
        done();
      })
      .catch(error => done(error));
  });

  it('Should successfully hash transaction (86)', (done) => {
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a2005820820058';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[0].tx).to.equal('8951e9b60e6484e1d4b67a3d9be03398335d5d580aef6ecfbddba3cdc2830c87');
        done();
      })
      .catch(error => done(error));
  });

  it('Should successfully hash transaction (54)', (done) => {
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e1';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[0].tx).to.equal('5fb3049dd6b33443d99bbc3219fb5586e75600806bfe5bdd95e545b6ca2aa8db');
        done();
      })
      .catch(error => done(error));
  });

  it('Should handle lowest possible hash value', (done) => {
    const address = '00';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[0].tx).to.equal('03170a2e7597b7b7e3d84c05391d139a62b157e78786d8c082f29dcf4c111314');
        done();
      })
      .catch(error => done(error));
  });

  it('Should return empty for empty string', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction('');
      })
      .then((res) => {
        expect(res.length).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });

  it('Should hash transaction with 30 iterations (stress test)', (done) => {
    const length = 30;
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9b63fc010c06fbe92cf6f820587406534795958c411e662dc014443c0688e001a6768cc86';
    const addresses = Array.from({ length }, (v, i) => address);

    getLedger()
      .then((device) => {
        ledger = device;
        return Promise.all(addresses.map(address => ledger.testHashTransaction(address)));
      })
      .then(responses => {
        responses.forEach((res) => {
          expect(res[1].tx).to.equal('40eaf5b817d73e4c239caf6b11c554fcb58a77e7a7f8635e4e1d5900cc3ae947');
        });
        done();
      })
      .catch(error => done(error));
  });
});
