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
    it('Should successfully base58 encode a valid address (168)', (done) => {
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

    it('Should successfully base58 encode a valid address (96)', (done) => {
      const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('5oP9ibJgeUpYTNH63zMtZpGW9HvKqmivuW9LZ8rjwFYmyRc5ck1XPuRLUPmGfmqmyS');
          expect(res.addressLength).to.equal(66);
          done();
        })
        .catch(error => done(error));
    });

    it('Should successfully base58 encode a valid address (86)', (done) => {
      const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a2005820820058';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('Ae2tdQQF3CnPrUGo38JavTvDTzJs1Y9G65U4dSETMDUdr1rhXGDyu8hrhKV');
          expect(res.addressLength).to.equal(59);
          done();
        })
        .catch(error => done(error));
    });

    it('Should successfully base58 encode a valid address (54)', (done) => {
      const address = "82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e1";

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('JggfeJYzKnHo6CUKakUwBpbkZYkRGcuf72szg');
          expect(res.addressLength).to.equal(37);
          done();
        })
        .catch(error => done(error));
    });

    it('Should successfully base58 encode an all 0 address', (done) => {
      const address = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
          expect(res.addressLength).to.equal(84);
          done();
        })
        .catch(error => done(error));
    });

    it('Should successfully base58 encode an all f address', (done) => {
      const address = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then((res) => {
          expect(res.encodedAddress).to.equal('KFkZCd6ceBYVN8e8bNgC31W2UoK3odH6K184U8cap3ybmSAs536NFvWdhYcoSjANHiEJptMGjRmUds6rAKYs5Rnii2Y9NeDmTRa6wrKATG9BvH1eJxW');
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

    it('Should reject 248 byte input (APDU max size test)', (done) => {
      const address = '000000000000000000000000000000003a41c927040000000000000000000000b8e0bb0101000000fa4ee21705000000000000000000000050dfbb01010000001e33275b01000000000000000000000098dfbb0101000000d66409c6020000000040000000000000e8b585020100000028b5850201000000ffffffffffffffffffffffff02000000010000000200000040c6fb000100000068b1850201000000070000000500010048b9850201000000b8c38502010000000000000000000000004000000000000048b685020100000088b5850201000000ffffffffffffffffffffffff03000000010000000300000040c6fb0001000000';

      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.testBase58Encode(address);
        })
        .then(res => done(res))
        .catch(error => done());
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

    it('Should base58 encode with 40 iterations (stress test)', (done) => {
      const length = 40;
      const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e18609ede8589f82f7f0a20058208200581c240596b9b63fc010c06fbe92cf6f820587406534795958c411e662dc014443c0688e001a6768cc86';
      const addresses = Array.from({ length }, (v, i) => address);

      getLedger()
        .then((device) => {
          ledger = device;
          return Promise.all(addresses.map(address => ledger.testBase58Encode(address)));
        })
        .then(responses => {
          responses.forEach((res) => {
            expect(res.encodedAddress).to.equal('AL91N9VXRTCypFouG2KjJvJuvKmUC4p3XcpHnYETWRG5HJVpi2ixeN1nG5EWtbJCH71YjzhqHKcsmmPYGRjy8nHDe2i17BEf9hTqDDLmcFVbHxx1GW9');
            expect(res.addressLength).to.equal(115);
          });
          done();
        })
        .catch(error => done(error));
    });
  });
});
