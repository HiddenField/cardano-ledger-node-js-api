const Int64 = require('node-int64');
const LedgerAda = require('../../src/ledger-ada');
const utils = require('../../src/utils');

/**
 * Check Base58 encoding on the device. This is for testing purposes only and is not available in production.
 *
 * @param {String} txHex The hexadecimal address for encoding.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.testBase58Encode = function(txHex) {
  var headerLength = 9;
  var tx = new Buffer(txHex, 'hex');
  var offset = 0;

  var buffer = Buffer.alloc(headerLength + tx.length);
  buffer[0] = 0x80;
  buffer[1] = 0x08;
  buffer[2] = 0x00;
  buffer[3] = 0x00;
  buffer[4] = 0x00;
  buffer.writeUInt32BE( tx.length, 5);

  // Body
  tx.copy(buffer, headerLength, offset, offset + tx.length);

  return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(response) {
    var result = {};
    response = Buffer.from(response, 'hex');
    var encodedAddressLength = response[0];
    result['success'] = true;
    result['Response'] = response.toString('hex');
    result['addressLength'] = encodedAddressLength;
    result['encodedAddress'] = response.slice(1, 1 + encodedAddressLength).toString();
    return result;
  });
}

/**
 * Check CBOR decoding on the device. This is for testing purposes only and is not available in production.
 *
 * @param {String} txHex The hexadecimal address for encoding.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.testCBORDecode = function(txHex) {
  var apdus = [];
  var response = [];
  var offset = 0;
  var headerLength = 9;
  var tx = new Buffer(txHex, 'hex');
  var self = this;

  var maxChunkSize = LedgerAda.MAX_CHUNK_SIZE - headerLength;
  var isSingleAPDU = tx.length < maxChunkSize;

  while (offset != tx.length) {
    var isLastAPDU = tx.length - offset < maxChunkSize;
    var chunkSize = (isLastAPDU ? tx.length - offset : maxChunkSize);

    var buffer = new Buffer(headerLength + chunkSize);
    // Header
    buffer[0] = 0x80;
    buffer[1] = 0x09;
    buffer[2] = (offset == 0 ? 0x01 : 0x02);
    buffer[3] = (isSingleAPDU ? 0x01 : 0x02);
    buffer[4] = 0x00;
    buffer.writeUInt32BE( offset == 0 ? tx.length : chunkSize, 5);
    // Body
    tx.copy(buffer, headerLength, offset, offset + chunkSize);
    apdus.push(buffer.toString('hex'));

    offset += chunkSize;
  }

  return utils.foreach(apdus, function(apdu) {
    return self.comm.exchange(apdu, [0x9000]).then(function(apduResponse) {
      var result = {};
      result['success'] = true;
      var offset = 0;
      if(apduResponse.length > 4) {
        response = Buffer.from(apduResponse, 'hex');
        result['success'] = true;
        result['txInputs'] = response[offset++];
        result['txOutputs'] = response[offset++];

        var index = 0;
        while (offset < (apduResponse.length/2) - 2) {
          var tx = {};
          // Set index
          tx.index = index;
          // Read amount
          tx.checksum = response.readUInt32BE(offset);
          //tx.checksum = response.slice(offset, offset + 4).toString('hex');
          offset += 5;
          // Read address
          //tx.amount = response.slice(offset, offset + 8).toString('hex');
          tx.amount = new Int64(response.readUInt32LE(offset + 4), response.readUInt32LE(offset)).toOctetString();
          offset += 9;
          // Check if at the end
          result['tx' + index ] = tx;
          index++;
          //result['dataLength'] = response.slice(5, 8).toString('hex');
          //result['transactionOffset'] = response.slice(9, 12).toString('hex');
          //console.log("Response["+ apduResponse + "] Offset[" + offset + "] Length[" + apduResponse.length + "]");
        }
      }
      return result;
    });
  });
}

/**
 * Check transaction hashing on the device. This is for testing purposes only and is not available in production.
 *
 * @param {String} txHex The hexadecimal address for hashing.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.testHashTransaction = function(txHex) {
  var apdus = [];
  var response = [];
  var offset = 0;
  var headerLength = 9;
  var tx = new Buffer(txHex, 'hex');
  var self = this;

  var maxChunkSize = LedgerAda.MAX_CHUNK_SIZE - headerLength;
  var isSingleAPDU = tx.length < maxChunkSize;

  while (offset != tx.length) {
    var isLastAPDU = tx.length - offset < maxChunkSize;
    var chunkSize = (isLastAPDU ? tx.length - offset : maxChunkSize);

    var buffer = new Buffer(headerLength + chunkSize);
    // Header
    buffer[0] = 0x80;
    buffer[1] = 0x04;
    buffer[2] = (offset == 0 ? 0x01 : 0x02);
    buffer[3] = (isSingleAPDU ? 0x00 : 0x02);
    buffer[4] = 0x00;
    buffer.writeUInt32BE( offset == 0 ? tx.length : chunkSize, 5);
    // Body
    tx.copy(buffer, headerLength, offset, offset + chunkSize);
    apdus.push(buffer.toString('hex'));

    offset += chunkSize;
  }

  return utils.foreach(apdus, function(apdu) {
    return self.comm.exchange(apdu, [0x9000]).then(function(apduResponse) {
      var result = {};
      result['success'] = true;
      result['respLength'] = apduResponse.toString('hex').length;
      result['resp'] = apduResponse.toString('hex');
      if(apduResponse.length > 4) {
        response = Buffer.from(apduResponse, 'hex');
        var offset = 2;
        // Read 256bit (32 byte) hash
        //result['txLength'] = apduResponse.slice(offset, offset + 16).toString('hex');
        //offset += 16;
        result['tx'] = apduResponse.slice(offset, offset + 64).toString('hex');
      }

      return result;
    })
  });
};

module.exports = LedgerAda;
