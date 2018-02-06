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

  it('Should successfully hash an all 0 address', (done) => {
    const address = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[1].tx).to.equal('f1c40a736271d3e2d53204b47b3a12eec6e62f70862c7b933fe3b566d3ae4a7d');
        done();
      })
      .catch(error => done(error));
  });
  
  it('Should successfully hash an all f address', (done) => {
    const address = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then((res) => {
        expect(res[1].tx).to.equal('604b4408b4ff535e7251caf020c2e210da29dcca818fce79f7c5f717cf4998d0');
        done();
      })
      .catch(error => done(error));
  });
 
  it('Should reject invalid hexadecimal characters', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction('abcdefg');
      })
      .then(res => done(res))
      .catch(error => done());
  });

  it('Should reject invalid length hexadecimal', (done) => {
    const address = '82d81';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then(res => done(res))
      .catch(error => done());
  });
  
  it('Should reject 248 byte input (APDU max size test)', (done) => {
    const address = '000000000000000000000000000000003a41c927040000000000000000000000b8e0bb0101000000fa4ee21705000000000000000000000050dfbb01010000001e33275b01000000000000000000000098dfbb0101000000d66409c6020000000040000000000000e8b585020100000028b5850201000000ffffffffffffffffffffffff02000000010000000200000040c6fb000100000068b1850201000000070000000500010048b9850201000000b8c38502010000000000000000000000004000000000000048b685020100000088b5850201000000ffffffffffffffffffffffff03000000010000000300000040c6fb0001000000';
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction(address);
      })
      .then(res => {
        console.log(res);
        done(res);
      })
      .catch(error => done());
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

  it('Should reject a blank input', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testHashTransaction();
      })
      .then(res => done(res))
      .catch(error => done());
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
