const { yellow } = require('chalk');
const { comm_node } = require('../../src');
const ada = require('./ledger-ada');

const { argv } = process;

/**
 * Convenience function for retrieving the ADA Ledger.
 *
 * @returns {Promise<Object>} A promise that contains the ledger when fulfilled.
 */
function getLedger() {
  return new Promise((resolve, reject) => {
    return comm_node.create_async()
      .then(comm => new ada(comm))
      .then(ledger => resolve(ledger))
      .catch(error => reject(error));
  });
}

/**
 * Convenience function for prompting user to interact with ledger device.
 *
 * If --headless is supplied, then this is suppressed.
 */
function promptUser(message) {
  if (argv.includes('--headless')) return
  console.log(yellow.bgBlack('\n LEDGER DEVICE ') + yellow(` ${message.toUpperCase()}\n`));
}

module.exports = { 
  getLedger, 
  promptUser,
};
