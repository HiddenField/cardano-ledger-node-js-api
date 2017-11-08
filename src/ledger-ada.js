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

var Q = require('q');
var utils = require('./utils');

var LedgerAda = function(comm) {
	this.comm = comm;
	this.comm.setScrambleKey('ADA');
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
		var addressLength = response[1 + publicKeyLength];
		result['publicKey'] = response.slice(1, 1 + publicKeyLength).toString('hex');
		result['bitcoinAddress'] = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString('ascii');
		result['chainCode'] = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString('hex');
		return result;

	});
}

LedgerAda.prototype.getRandomWalletPublicKey_async = function() {
	var buffer = Buffer.alloc(4);
	buffer[0] = 0x80;
	buffer[1] = 0x0C;
	buffer[2] = 0x00;
	buffer[3] = 0x02;

	return this.comm.exchange(buffer.toString('hex'), [0x9000]).then(function(response) {
		var result = {};
		response = Buffer.from(response, 'hex');
		var publicKeyLength = response[0];
		var addressLength = response[1 + publicKeyLength];
		result['publicKey'] = response.slice(1, 1 + publicKeyLength).toString('hex');
		result['bitcoinAddress'] = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString('ascii');
		result['chainCode'] = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString('hex');
		return result;

	});
}


LedgerAda.MAX_SCRIPT_BLOCK = 50;
LedgerAda.DEFAULT_LOCKTIME = 0;
LedgerAda.DEFAULT_SEQUENCE = 0xffffffff;
LedgerAda.SIGHASH_ALL = 1;

module.exports = LedgerAda;
