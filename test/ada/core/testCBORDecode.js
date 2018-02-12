const Int64 = require('node-int64');
const { expect } = require('chai');
const { getLedger } = require('../utils');

describe('testCBORDecode', () => {
  let legder = {};

  afterEach(() => {
    ledger.comm.close_async()
      .then(() => {
        ledger = {};
      });
  });

  it('Should decode CBOR with 1 transaction', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then((res) => {
        const amount = new Int64(15597252095955044);

        expect(res[2].txInputs).to.equal(1);
        expect(res[2].txOutputs).to.equal(1);
        expect(res[2].tx0.amount).to.equal(amount.toOctetString());
        done();
      })
      .catch(error => done(error));
  });

  it('Should decode CBOR with 2 transactions', (done) => {
    const tx = '839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b000000d16b11cb538282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b002aa1f087327872ffa0';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then((res) => {
        const tx0Amount = new Int64(899444493139);
        const tx1Amount = new Int64(12000003454302322);

        expect(res[5].txInputs).to.equal(2);
        expect(res[5].txOutputs).to.equal(2);
        expect(res[5].tx0.amount).to.equal(tx0Amount.toOctetString());
        expect(res[5].tx1.amount).to.equal(tx1Amount.toOctetString());
        done();
      })
      .catch(error => done(error));
  });

  it('Should allow a transaction sending 18446744073709552000 lovelaces (64bit unsigned limit)', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861BFFFFFFFFFFFFFFFFA0';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then(res => {
        // We of course can't write 18446744073709552000 here, as it
        // exceeds Number.MAX_SAFE_INTEGER (that's why we're using Int64).
        // Instead, we use high and low bytes to correctly produce the set of octets.
        const amount = new Int64(0xffffffff, 0xfffffffff);
        
        expect(res[2].txInputs).to.equal(1);
        expect(res[2].txOutputs).to.equal(1);
        expect(res[2].tx0.amount).to.equal(amount.toOctetString());
        done()
      })
      .catch(error => done(error));
  });


  it('Should allow a transaction sending 0 lovelaces', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0000000000000000A0';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then(res => {
        const amount = new Int64(0);
        
        expect(res[2].txInputs).to.equal(1);
        expect(res[2].txOutputs).to.equal(1);
        expect(res[2].tx0.amount).to.equal(amount.toOctetString());
        done()
      })
      .catch(error => done(error));
  });
 
  it('Should reject a transaction sending over 64bit integer limit', (done) => {
    const tx = '839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861BFFFFFFFFFFFFFFFF01A0';

    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then(res => done(res))
      .catch((error) => {
        // 5903: Invalid TX Output
        expect(error).to.have.string('5903');
        done()
      });
  });
  
  it('Should reject a transaction with no inputs', (done) => {
    const tx = '8381810082828283581CE6E37D78F4326709AF13851862E075BCE800D06401AD5C370D4D48E8A20058208200581C23F1DE5619369C763E19835E0CB62C255C3FCA80AA13057A1760E804014F4E4CED4AA010522E84B8E70A121894001AE41EF3231B0075FAE341E48715828283581CFD9104B3EFB4C7425D697EEB3EFC723EF4FF469E7F37F41A5AFF78A9A20058208200581C53345E24A7A30EC701611C7E9D0593C41D6EA335B2EB195C9A0D2238015818578B485ADC9D142B1E692DE1FD5929ACFC5A31332938F192011AD0FCDC751B0003D8257C6B4DB7A0';
 
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then(res => done(res))
      .catch((error) => {
        // 5902: Invalid TX (must have > 0 inputs)
        expect(error).to.have.string('5902');
        done()
      });
  });
  
  it('Should reject a transaction with invalid input', (done) => {
    const tx = '839F8200D8180026820020E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0';
 
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode(tx);
      })
      .then(res => done(res))
      .catch((error) => {
        // 5901: Invalid TX Output
        expect(error).to.have.string('5901');
        done()
      });
  });
  
  it('Should reject a blank input', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode();
      })
      .then(res => done(res))
      .catch(error => done());
  });

  it('Should return empty for empty string', (done) => {
    getLedger()
      .then((device) => {
        ledger = device;
        return ledger.testCBORDecode('');
      })
      .then((res) => {
        expect(res.length).to.equal(0);
        done();
      })
      .catch(error => done(error));
  });
});
