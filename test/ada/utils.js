const { comm_node, ada } = require('../../src');

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

module.exports = { getLedger };
