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

'use strict';

/*
 * ADA APDU I/O Buffer Structure
 *
 * buffer[0] = APDU IDENTIFIER
 * buffer[1] = INSTRUCITON NO
 * buffer[2] = P1 VALUE
 * buffer[3] = P2 VALUE
 * buffer[4] = CDATA_LENGTH
 * buffer[5] = PATH_LENGTH
 * buffer[...] = DATA
 * buffer[END] = 0x9000 OKAY
 */

var Q = require('q');
var utils = require('./utils');

var LedgerAda = function(comm) {
	this.comm = comm;
	this.comm.setScrambleKey('ADA');
}

LedgerAda.prototype.isApduSuccess = function(apduResponse) {

		if(LedgerAda.SUCCESS_CODE  ===
			apduResponse.slice(apduResponse.length-4, apduResponse.length)) {

				return true;

		} else {

				return false;

		}
}


LedgerAda.prototype.getWalletPublicKey_async = function(path) {
	var splitPath = utils.splitPath(path);
	var buffer = Buffer.alloc(5 + 1 + splitPath.length * 4);
	buffer[0] = 0x80;
	buffer[1] = 0x02;
	buffer[2] = 0x00;
	buffer[3] = 0x02;
	buffer[4] = 1 + splitPath.length * 4;
	buffer[5] = splitPath.length;
	splitPath.forEach(function (element, index) {
		buffer.writeUInt32BE(element, 6 + 4 * index);
	});
	var self = this;
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

LedgerAda.prototype.getRandomWalletPublicKey_async = function() {
	var buffer = Buffer.alloc(6);
	buffer[0] = 0x80;
	buffer[1] = 0x0C;
	buffer[2] = 0x00;
	buffer[3] = 0x02;
	buffer[4] = 0x01;
	buffer[5] = 0x00;

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

LedgerAda.prototype.getWalletPublicKeyFrom_async = function(address_index) {

	// TODO: Test if the address index is above 0x80000000, and if less, throw an error.
	// Nano S can only derive hardened addresses on ED25519 curve.

	if(isNaN(address_index)) {
		var result = {};
		result['success'] = false;
		result['error'] = "Address index is not a number."
		return result;
	}

	var buffer = Buffer.alloc(10);
	buffer[0] = 0x80;
	buffer[1] = 0x0C;
	buffer[2] = 0x00;
	buffer[3] = 0x02;
	buffer[4] = 0x05;
	buffer[5] = 0x01;
	buffer.writeUInt32BE(address_index, 6);

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



LedgerAda.prototype.getWalletIndex_async = function() {

	var buffer = Buffer.alloc(2);
	buffer[0] = 0x80;
	buffer[1] = 0x0E;

	return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(response) {
		var result = {};
		response = Buffer.from(response, 'hex');
		var walletIndexLength = response[0];
		result['success'] = true;
		result['walletIndex'] = response.slice(1, 1 + walletIndexLength).toString('hex');
		return result;

	});
}

LedgerAda.prototype.testBase58Encode_async = function(txHex) {

	var headerLength = 9;
	var tx = new Buffer(txHex, 'hex');
	var offset = 0;

	console.log("Transaction Length[" + tx.length + "]")

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
		result['Address Length'] = encodedAddressLength;
		result['encodedAddress'] = response.slice(1, 1 + encodedAddressLength).toString();
		return result;

	});
}


LedgerAda.prototype.signTransaction_async = function(txHex) {

	var apdus = [];
	var response = [];
	var offset = 0;
	var headerLength = 9;
	var tx = new Buffer(txHex, 'hex');
	var self = this;

	var maxChunkSize = LedgerAda.MAX_CHUNK_SIZE - headerLength;
	var isSingleAPDU = tx.length < maxChunkSize;

	console.log("Transaction Length[" + tx.length + "]");
	console.log("Transaction Buffer[" + tx.toString('hex') + "]");
	console.log("Is Single APDU[" + isSingleAPDU + "]")
	console.log("Max Chunk Size[" + maxChunkSize + "]");

	while (offset != tx.length) {

		var isLastAPDU = tx.length - offset < maxChunkSize;
		var chunkSize = (isLastAPDU ?	tx.length - offset : maxChunkSize);

		console.log("Data Size[" + chunkSize + "]");

		var buffer = new Buffer(headerLength + chunkSize);
		// Header
		buffer[0] = 0x80;
		buffer[1] = 0x06;
		buffer[2] = (offset == 0 ? 0x01 : 0x02);
		buffer[3] = (isSingleAPDU ? 0x01 : 0x02);
		buffer[4] = 0x00;
		buffer.writeUInt32BE( offset == 0 ? tx.length : chunkSize, 5);
		// Body
		tx.copy(buffer, headerLength, offset, offset + chunkSize);
		apdus.push(buffer.toString('hex'));
		console.log("APDU Buffer[" + buffer.toString('hex') + "]");

		offset += chunkSize;

	}

	return utils.foreach(apdus, function(apdu) {
			return self.comm.exchange(apdu, [0x9000]).then(function(apduResponse) {
					var result = {};
					result['success'] = true;
					if(apduResponse.length > 2) {
							response = Buffer.from(apduResponse, 'hex');
							result['success'] = true;
							var offset = 2;
							var index = 0;
							while (offset < (apduResponse.length/2) - 2) {
									var tx = {};
									// Set index
									tx.index = index;
									// Read amount
									tx.checksum = response.slice(offset, offset + 4).toString('hex');
									offset += 5;
									// Read address
									tx.amount = response.slice(offset, offset + 8).toString('hex');
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
			})
	});
}



LedgerAda.prototype.hashTransaction_async = function(txHex) {

	var apdus = [];
	var response = [];
	var offset = 0;
	var headerLength = 9;
	var tx = new Buffer(txHex, 'hex');
	var self = this;

  var maxChunkSize = LedgerAda.MAX_CHUNK_SIZE - headerLength;
	var isSingleAPDU = tx.length < maxChunkSize;

	console.log("Transaction Length[" + tx.length + "]")
	console.log("Transaction Buffer[" + tx.toString('hex') + "]");
	console.log("Is Single APDU[" + isSingleAPDU + "]")
	console.log("Max Chunk Size[" + maxChunkSize + "]");

	while (offset != tx.length) {

		var isLastAPDU = tx.length - offset < maxChunkSize;
		var chunkSize = (isLastAPDU ?	tx.length - offset : maxChunkSize);

		console.log("Data Size[" + chunkSize + "]");

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
		console.log("APDU Buffer[" + buffer.toString('hex') + "]");

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
}







LedgerAda.prototype.setTransaction_async = function(txHex) {

	var apdus = [];
	var response = [];
	var offset = 0;
	var headerLength = 9;
	var tx = '';
	var self = this;

  try {
    tx = new Buffer(txHex, 'hex');
  } catch (error) {
    return Q.reject(error);
  }

	var maxChunkSize = LedgerAda.MAX_CHUNK_SIZE - headerLength;
	var isSingleAPDU = tx.length < maxChunkSize;

	console.log("Transaction Length[" + tx.length + "]");
	console.log("Transaction Buffer[" + tx.toString('hex') + "]");
	console.log("Is Single APDU[" + isSingleAPDU + "]")
	console.log("Max Chunk Size[" + maxChunkSize + "]");

	while (offset != tx.length) {

		var isLastAPDU = tx.length - offset < maxChunkSize;
		var chunkSize = (isLastAPDU ?	tx.length - offset : maxChunkSize);

		console.log("Data Size[" + chunkSize + "]");

		var buffer = new Buffer(headerLength + chunkSize);
		// Header
		buffer[0] = 0x80;
		buffer[1] = 0x05;
		buffer[2] = (offset == 0 ? 0x01 : 0x02);
		buffer[3] = (isSingleAPDU ? 0x01 : 0x02);
		buffer[4] = 0x00;
		buffer.writeUInt32BE( offset == 0 ? tx.length : chunkSize, 5);
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
					apduResponse.slice(responseHexLength-4, responseHexLength) ?
					true : false;
				result['respLength'] = apduResponse.toString('hex').length;
				result['resp'] = apduResponse.toString('hex');
				if(apduResponse.length > 4) {
						response = Buffer.from(apduResponse, 'hex');
						var offset = 0;
						// Read 256bit (32 byte) hash
						//result['txLength'] = apduResponse.slice(offset, offset + 16).toString('hex');
						//offset += 16;
						result['tx'] = apduResponse.slice(offset, offset + LedgerAda.TX_HASH_SIZE).toString('hex');
				}

				return result;

			})
  });
}



LedgerAda.prototype.setSigningIndexes_async = function(signingIndexes) {

		var apdus = [];
		var response = [];
		var offset = 0;
		var headerLength = 8;
		var offset = headerLength;
		var self = this;
		var indexCount = signingIndexes.length;

		console.log("Number of Indexes[" + indexCount + "]");

		var buffer = new Buffer(headerLength + (indexCount * 4));
		// Header
		buffer[0] = 0x80;
		buffer[1] = 0x07;
		buffer[2] = 0x00;
		buffer[3] = 0x00;
		buffer.writeUInt32BE( indexCount, 4);
		// Body
		// Write each signing index as a 4 byte int.
		for(var i = 0; i < indexCount; i++) {
				buffer.writeUInt32BE( signingIndexes[i], offset);
				offset += 4;
		}

		return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(apduResponse) {
			var result = {};

			var responseHexLength = apduResponse.toString('hex').length;
			response = Buffer.from(response, 'hex');

			result['success'] = "9000" ===
				apduResponse.slice(responseHexLength-4, responseHexLength) ?
				true : false;

			indexCount = response.slice(0, 1).toString('hex');
			if(!isNaN(indexCount)) {
					for(var i = 0; i < indexCount; i++) {
							var indexOffest = indexCount * 4 + 1;
							result[i] = response.slice(indexCount * 4 + 1, (indexCount * 4 + 1) + 4)
					}
			} else {
				  result["error"] = "No indexes found in response";
			}

			return result;

		});
}







LedgerAda.prototype.setSignTransaction_async = function(addressIndex) {

		var apdus = [];
		var response = [];
		var offset = 0;
		var headerLength = 8;
		var offset = headerLength;
		var self = this;

		console.log("Signing with address index[" + addressIndex + "]");

		var buffer = new Buffer(headerLength + 4);
		// Header
		buffer[0] = 0x80;
		buffer[1] = 0x06;
		buffer[2] = 0x00;
		buffer[3] = 0x00;
		buffer.writeUInt32BE( addressIndex, 4);
		// Body

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
LedgerAda.TX_HASH_SIZE = 64;
LedgerAda.MAX_CHUNK_SIZE = 64;
LedgerAda.MAX_TX_LENGTH = 2000;

module.exports = LedgerAda;
