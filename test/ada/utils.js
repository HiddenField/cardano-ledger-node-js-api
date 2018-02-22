const { expect } = require('chai');
const { yellow } = require('chalk');
const Joi = require('Joi');
const { comm_node } = require('../../src');
const ada = require('./ledger-ada');

function isHeadless() {
  return process.argv.includes('--headless');
}

/**
 * Run a mocha test only if the build is headless.
 *
 * This is useful for stress tests which are too laborious to run with user interaction.
 */
function ifHeadlessIt(title, test) {
  return isHeadless() ? it(title, test) : it.skip(`[SKIPPED: NOT IN HEADLESS] ${title}`, () => {});
}

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
 * @param {String} message The messsage to display.
 *
 * If --headless is supplied, then this is suppressed.
 */
function promptUser(message) {
  if (isHeadless()) return
  console.log(yellow.bgBlack('\n LEDGER DEVICE ') + yellow(` ${message.toUpperCase()}\n`));
}

/**
 * Validate a response against a Joi schema.
 *
 * @param {Object} response   The response to validate.
 * @param {Joi.object} schema The Joi schema to validate against.
 */
function validate(response, schema) {
  const { error, value } = Joi.validate(response, schema);
  expect(error).to.be.null;
}

module.exports = {
  getLedger,
  promptUser,
  ifHeadlessIt,
  validate,
};
