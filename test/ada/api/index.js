const { expect } = require('chai');
const { yellow } = require('chalk');
const { getLedger } = require('../utils');

/**
 * Convenience function for prompting user to interact with ledger device.
 */
function promptUser(message) {
  console.log(yellow.bgBlack('\n LEDGER DEVICE ') + yellow(` ${message.toUpperCase()}\n`));
}

describe('Cardano ADA: API', () => {
  let legder = {};

  afterEach(() => {
    ledger.comm.close()
      .then(() => {
        ledger = {};
      });
  });

  describe('setTransaction', () => {
    it('Should correctly set a transaction', (done) => {
      const transaction = '839f8200d8185826825820de3151a2d9cd8e2bbe292a6153d679d123892ddcfbee869c4732a5c504a7554d19386cff9f8282d818582183581caeb153a5809a084507854c9f3e5795bcca89781f9c386d957748cd42a0001a87236a1f1b00780aa6c7d62110ffa0';
      
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.setTransaction(transaction);
        })
        .then((res) => {
          expect(res[1].resp).to.equal('70081eeb1f312ec75af1b4f94a7963db3b264f2451369e4ea244a54de5d06e369000');
          expect(res[1].tx).to.equal('70081eeb1f312ec75af1b4f94a7963db3b264f2451369e4ea244a54de5d06e36');
          done();
        })
        .catch(error => done(error));
    });
    
    it('Should not set an invalid transaction', (done) => {
      const transaction = new Array(207).join('8');
      
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.setTransaction(transaction);
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
        .then((res) => {
          done('Accepted empty transaction');
        })
        .catch((error) => {
          done();
        });
    });
    
    it('Should not set incomplete transaction', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          return ledger.setTransaction('839f8200d');
        })
        .then((res) => {
          done('Accepted incomplete transaction');
        })
        .catch((error) => done());
    });
  });
  
  describe('getWalletPublicKey', () => {
    it('Should successfully get public key for path', (done) => {
      getLedger()
        .then((device) => {
          ledger = device;
          promptUser('Please accept public key request');
          
          return ledger.getWalletPublicKey("44'/1815'/0'/0'/0'");
        })
        .then((res) => {
          expect(res).to.have.property('publicKey');
          expect(res).to.have.property('chainCode');
          done();
        })
        .catch((error) => done(error));
    }).timeout(10000);
  });
});
