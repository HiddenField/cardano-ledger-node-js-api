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

  it('Should reject 1024 byte input (APDU max size test)', (done) => {
    const address = '839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a00a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a';

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
