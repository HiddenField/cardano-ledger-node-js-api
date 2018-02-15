const { expect } = require('chai');
const { getLedger, promptUser } = require('../utils');

describe('setTransaction', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it.skip('Should correctly set a transaction', (done) => {
    const tx = '839f8200d8185826825820de3151a2d9cd8e2bbe292a6153d679d123892ddcfbee869c4732a5c504a7554d19386cff9f8282d818582183581caeb153a5809a084507854c9f3e5795bcca89781f9c386d957748cd42a0001a87236a1f1b00780aa6c7d62110ffa0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.setTransaction(tx);
      })
      .then((res) => {
        expect(res[1].resp).to.equal('70081eeb1f312ec75af1b4f94a7963db3b264f2451369e4ea244a54de5d06e369000');
        expect(res[1].tx).to.equal('70081eeb1f312ec75af1b4f94a7963db3b264f2451369e4ea244a54de5d06e36');
        done();
      })
      .catch(error => done(error));
  })

  it('Should not set an invalid transaction', (done) => {
    const tx = new Array(207).join('8');

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.setTransaction(tx);
      })
      .then((res) => {
        done(new Error('Device set invalid transaction'));
      })
      .catch((error) => {
        expect(error).to.be.a('string');
        done();
      });
  });

  it('Should not set an empty transaction', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.setTransaction();
      })
      .then(res => done(res))
      .catch(error => done());
  });

  it('Should not set incomplete transaction', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.setTransaction('839f8200d');
      })
      .then(res => done(res))
      .catch(error => done());
  });
});
