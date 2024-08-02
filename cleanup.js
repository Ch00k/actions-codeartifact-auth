const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');

async function cleanup() {
  await io.rmRF('.npmrc');
  await io.rmRF('gradle.properties');
  await io.rmRF('.pypirc');
  await io.rmRF('.pip.conf');
}

module.exports = cleanup;

/* istanbul ignore next */
if (require.main === module) {
  cleanup();
}
