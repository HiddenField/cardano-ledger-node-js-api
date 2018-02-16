const { expect } = require('chai');
const { getLedger, promptUser } = require('../utils');

describe('signTransaction', () => {
  let ledger = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it('Should correctly sign a transaction with 1 output', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.signTransaction(tx, [0xFFFFFFFF]);
      })
      .then((res) => {
        expect(res[0]).to.have.property('digest');
        done();
      })
      .catch(error => done(error));
  });

  it('Should reject signing a transaction with non-hardened index', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.signTransaction(tx, [0x34565544]);
      })
      .then((res) => done(res))
      .catch((error) => {
        expect(error).to.have.string('5201');
        
        // Reset here so we don't end up stuck for further tests
        return ledger.setTransaction(tx).catch(error => done());
      })
      .catch(error => done(error));
  });
});
