const { expect } = require('chai');
const { getLedger } = require('../utils');

describe('Cardano ADA: Core', () => {
  let legder = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  describe('testBase58Encode', () => {
    it('Should successfully base58 encode a valid wallet address', (done) => {
			const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9b63fc010c06fbe92cf6f820587406534795958c411e662dc014443c0688e001a6768cc86';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('AL91N9VXRTCypFouG2KjJvJuvKmUC4p3XcpHnYETWRG5HJVpi2ixeN1nG5EWtbJCH71YjzhqHKcsmmPYGRjy8nHDe2i17BEf9hTqDDLmcFVbHxx1GW9');
          expect(res.addressLength).to.equal(115);
          done();
        })
        .catch(error => done(error));
    });
    
    it('Should successfully return empty for empty string', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode('');
        })
        .then(res => {
          expect(res.encodedAddress).to.equal('');
          expect(res.addressLength).to.equal(0);
          done()
        })
        .catch(error => done(error));
    });

    it('Should reject a blank input', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode();
        })
        .then(res => done(res))
        .catch(error => done());
    });

    it('Should reject an input larger than hex size', (done) => {
      const address = new Buffer(256).toString('hex');
      console.log(address);

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then(res => done(res))
        .catch(error => {
          console.log(error);
          done();
        });
    });

    it('Should reject invalid hexadecimal characters', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode('abcdefg');
        })
        .then(res => done(res))
        .catch(error => done());
    });

    it('Should reject invalid length hexadecimal', (done) => {
			const address = '82d81';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then(res => done(res))
        .catch(error => done());
    });
  });
});
