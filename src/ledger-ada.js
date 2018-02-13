/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

/*
 * ADA APDU I/O Buffer Structure
 * // Header
 * buffer[0] = APDU IDENTIFIER
 * buffer[1] = INSTRUCITON NO
 * buffer[2] = P1 VALUE
 * buffer[3] = P2 VALUE
 * buffer[4] = CDATA_LENGTH
 * // Data
 * buffer[...] = DATA
 * buffer[END] = 0x9000 OKAY
 */

const Q = require('q');
const utils = require('./utils');
const Int64 = require('node-int64');

const LedgerAda = function(comm) {
  this.comm = comm;
  this.comm.setScrambleKey('ADA');
}

/**
 * Check whether a given APDU response is a success response.
 *
 * @param {Object} apduResponse The APDU response.
 * @returns True if response is successful.
 */
LedgerAda.prototype.isApduSuccess = function(apduResponse) {
  return LedgerAda.SUCCESS_CODE === apduResponse.slice(apduResponse.length-4, apduResponse.length);
}

/**
 * Get a public key (address) from the specified index on the device.
 *
 * @param {Number} index The index to retrieve.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.getWalletPublicKeyWithIndex = function(index) {
  // TODO: Test if the address index is above 0x80000000, and if less, throw an error.
  // Nano S can only derive hardened addresses on ED25519 curve.

  if(isNaN(index)) {
    var result = {};
    result['success'] = false;
    result['code'] = LedgerAda.INDEX_NAN;
    result['error'] = "Address index is not a number."
    return Q.reject(result);
  }

  var buffer = Buffer.alloc(LedgerAda.OFFSET_CDATA + 4);
  buffer[0] = 0x80;
  buffer[1] = LedgerAda.INS_GET_PUBLIC_KEY;
  buffer[2] = 0x02;
  buffer[3] = 0x00;
  // Data Length
  buffer.writeUInt32BE(4, LedgerAda.OFFSET_LC);
  // Data
  buffer.writeUInt32BE(index, LedgerAda.OFFSET_CDATA);

  return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(response) {
    var result = {};
    response = Buffer.from(response, 'hex');
    var publicKeyLength = response[0];
    result['success'] = true;
    result['publicKey'] = response.slice(1, 1 + publicKeyLength).toString('hex');

    return result;
  });
}

/**
 * Get the extended public key from the wallet, also known as the recovery passphrase.
 *
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.getWalletRecoveryPassphrase = function() {
  var buffer = Buffer.alloc(LedgerAda.OFFSET_CDATA);

  buffer[0] = 0x80;
  buffer[1] = LedgerAda.INS_GET_PUBLIC_KEY;
  buffer[2] = 0x01;
  buffer[3] = 0x00;
  // Data Length
  buffer.writeUInt32BE(0, LedgerAda.OFFSET_LC);

  return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(response) {
    var result = {};
    response = Buffer.from(response, 'hex');
    var publicKeyLength = response[0];
    result['success'] = true;
    result['publicKey'] = response.slice(1, 1 + publicKeyLength).toString('hex');
    result['chainCode'] = response.slice(1 + publicKeyLength, 1 + publicKeyLength + 32).toString('hex');
    return result;
  });
}

/**
 * Set the transaction.
 *
 * @param {String} txHex The transaction to be set.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.setTransaction = function(txHex) {
  var apdus = [];
  var response = [];
  var offset = 0;
  var headerLength = LedgerAda.OFFSET_CDATA;
  var tx = '';
  var self = this;

  try {
    tx = new Buffer(txHex, 'hex');
  } catch (error) {
    return Q.reject(error);
  }

  var maxChunkSize = LedgerAda.MAX_APDU_SIZE - headerLength;
  var isSingleAPDU = tx.length < maxChunkSize;

  console.log("Transaction Length[" + tx.length + "]");
  console.log("Transaction Buffer[" + tx.toString('hex') + "]");
  console.log("Is Single APDU[" + isSingleAPDU + "]")
  console.log("Max Chunk Size[" + maxChunkSize + "]");

  while (offset != tx.length) {

    var isLastAPDU = tx.length - offset < maxChunkSize;
    var chunkSize = (isLastAPDU ? tx.length - offset : maxChunkSize);

    console.log("Data Size[" + chunkSize + "]");

    var buffer = new Buffer(headerLength + chunkSize);
    // Header
    buffer[0] = 0x80;
    buffer[1] = LedgerAda.INS_SET_TX;
    buffer[2] = (offset == 0 ? 0x01 : 0x02);
    buffer[3] = (isSingleAPDU ? 0x01 : 0x02);
    buffer.writeUInt32BE( offset == 0 ? tx.length : chunkSize, 4);
    // Body
    // Body
    tx.copy(buffer, headerLength, offset, offset + chunkSize);


    apdus.push(buffer.toString('hex'));
    console.log("APDU Buffer[" + buffer.toString('hex') + "]");

    offset += chunkSize;

  }

  return utils.foreach(apdus, function(apdu) {
    return self.comm.exchange(apdu, [0x9000]).then(function(apduResponse) {
      var result = {};

      var responseHexLength = apduResponse.toString('hex').length;
      console.log("FROM[" + (responseHexLength-4) + "] TO[" + responseHexLength + "]")
      console.log("SLICE:" + apduResponse.slice(responseHexLength-4, responseHexLength).toString('hex'));

      result['success'] = "9000" ===
        apduResponse.slice(responseHexLength - LedgerAda.CODE_LENGTH, responseHexLength) ?
        true : false;
      result['respLength'] = apduResponse.toString('hex').length;
      result['resp'] = apduResponse.toString('hex');
      if(apduResponse.length > LedgerAda.CODE_LENGTH) {
        response = Buffer.from(apduResponse, 'hex');
        var offset = 0;
        result['TxInputCount'] = response.readUInt8(offset++);
        result['TxOutputCount'] = response.readUInt8(offset++);
        for(var i=0; i<result['TxOutputCount']; i++) {
            result['Address_' + i] = response.slice(
                  offset, offset + LedgerAda.MAX_ADDR_PRINT_LENGTH).toString();
            offset += LedgerAda.MAX_ADDR_PRINT_LENGTH;
            result['Amount_' + i] = tx.amount = new Int64(
              response.readUInt32LE(offset + (LedgerAda.AMOUNT_SIZE/2)),
              response.readUInt32LE(offset)).toOctetString();
            offset+= LedgerAda.AMOUNT_SIZE;
        }
        // Read 256bit (32 byte) hash
        //result['txLength'] = apduResponse.slice(offset, offset + 16).toString('hex');
        //offset += 16;
        //result['tx'] = apduResponse.slice(offset, offset + LedgerAda.TX_HASH_SIZE).toString('hex');
      }

      return result;
    });
  });
}

/**
 * Sign the set transaction with the given index.
 * Note that setTransaction must be called prior to this being called.
 *
 * @param {Number} index The index of the key to be used for signing.
 * @returns {Promise<Object>} The response from the device.
 */
LedgerAda.prototype.signTransactionWithIndex = function(index) {
  var apdus = [];
  var response = [];
  var offset = 0;
  var headerLength = 8;
  var offset = headerLength;
  var self = this;

  if(isNaN(index)) {
    var result = {};
    result['success'] = false;
    result['code'] = LedgerAda.INS_GET_PUBLIC_KEY;
    result['error'] = "Address index is not a number."
    return Q.reject(result);
  }

  console.log("Signing with address index[" + index + "]");

  var buffer = new Buffer(headerLength + 4);
  // Header
  buffer[0] = 0x80;
  buffer[1] = LedgerAda.INS_SIGN_TX;
  buffer[2] = 0x00;
  buffer[3] = 0x00;
  // Data Length
  buffer.writeUInt32BE(4, LedgerAda.OFFSET_LC);
  // Data
  buffer.writeUInt32BE(index, LedgerAda.OFFSET_CDATA);

  return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(apduResponse) {
    var result = {};

    var responseHexLength = apduResponse.toString('hex').length;
    response = Buffer.from(response, 'hex');

    result['success'] = "9000" ===
      apduResponse.slice(responseHexLength-4, responseHexLength) ?
      true : false;
    result['respLength'] = apduResponse.toString('hex').length;
    result['resp'] = apduResponse.toString('hex');

    return result;

  });
}

LedgerAda.SUCCESS_CODE = "9000";
LedgerAda.CODE_LENGTH = 4;
LedgerAda.AMOUNT_SIZE = 8;
LedgerAda.TX_HASH_SIZE = 64;
LedgerAda.MAX_APDU_SIZE = 64;
LedgerAda.MAX_TX_HEX_LENGTH = 2048;
LedgerAda.MAX_MSG_LENGTH = 248;
LedgerAda.MAX_ADDR_PRINT_LENGTH = 12;
LedgerAda.OFFSET_CDATA = 8;
LedgerAda.OFFSET_LC = 4;
// Instruction Setup - Should match main.c
LedgerAda.INS_GET_PUBLIC_KEY = 0x01;
LedgerAda.INS_SET_TX = 0x02;
LedgerAda.INS_SIGN_TX = 0x03;
LedgerAda.INS_BLAKE2B_TEST = 0x07;
LedgerAda.INS_BASE58_ENCODE_TEST = 0x08;
LedgerAda.INS_CBOR_DECODE_TEST = 0x09;
// Error Codes
LedgerAda.MAX_TX_HEX_LENGTH_EXCEEDED = 5001;
LedgerAda.MAX_MSG_LENGTH_EXCEEDED = 5002;
LedgerAda.INDEX_NAN = 5003;

module.exports = LedgerAda;
