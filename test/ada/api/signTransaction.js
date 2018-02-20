const { expect } = require('chai');
const { getLedger, promptUser, ifHeadlessIt } = require('../utils');

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

  it('Should correctly sign a transaction with 2 outputs', (done) => {
    const tx = '839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b000000d16b11cb538282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b002aa1f087327872ffa0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.signTransaction(tx, [0xF00DB00B, 0x8BADF00D]);
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

  it('Should reject signing a transaction with index greater than maximum ', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.signTransaction(tx, [0xFFFFFFFF01]);
      })
      .then((res) => done(res))
      .catch((error) => {
        expect(error.code).to.equal(5302);

        // Reset here so we don't end up stuck for further tests
        return ledger.setTransaction(tx).catch(error => done());
      })
      .catch(error => done(error));
  });

  it('Should prevent signing a single transaction multiple times', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        promptUser('Please accept transaction');
        return ledger.signTransaction(tx, [0xBAD15C05, 0xCAFEBABE]);
      })
      .then((res) => done(res))
      .catch((error) => {
        expect(error).to.have.string('500e');

        done();
      })
      .catch(error => done(error));
  });

  ifHeadlessIt('Should sign transaction 20 times (stress test)', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    // Relax, it's cool. The reason we're doing this is because we need
    // the promises to be executed serially, to prevent us overloading
    // the ledger before the signing indexes have been reset. Yep, there
    // are 20 of those there.
    const check = (res) => {
      expect(res[0]).to.have.property('digest');
      return ledger.signTransaction(tx, [0xFFFFFFFF]);
    };

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.signTransaction(tx, [0xFFFFFFFF]);
      })
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => done())
      .catch(error => done(error));
  });
});
