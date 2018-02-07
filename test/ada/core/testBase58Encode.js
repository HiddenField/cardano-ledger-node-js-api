const { expect } = require('chai');
const { getLedger } = require('../utils');

describe('testBase58Encode', () => {
  let legder = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

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
    const address = '82d818584a83581ce7fe8e468d2249f18cd7bf9aec0d4374b7d3e1';

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

  it('Should reject 1024 byte input (APDU max size)', (done) => {
    const address = '839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a00a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a';
    
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testBase58Encode(address);
      })
      .then(res => done(res))
      .catch((error) => {
        expect(error).to.have.string('5001');
        done();
      })
      .catch(error => done(error));
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
