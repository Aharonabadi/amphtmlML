'use strict';

const colors = require('kleur/colors');
const fs = require('fs-extra');
const {ciBuildSha, isCiBuild} = require('../common/ci');
const {getStdout} = require('../common/process');
const {log} = require('../common/logging');
const {shortSha} = require('../common/git');

const {cyan, green, yellow} = colors;
const CODECOV_EXEC = './node_modules/.bin/codecov';
const COVERAGE_REPORTS = {
  'unit_tests': 'test/coverage/lcov-unit.info',
  'integration_tests': 'test/coverage/lcov-integration.info',
  'e2e_tests': 'test/coverage-e2e/lcov.info',
};

/**
 * Uploads a single report
 * @param {string} file
 * @param {string} flags
 */
function uploadReport(file, flags) {
  const codecovCmd = `${CODECOV_EXEC} --file=${file} --flags=${flags}`;
  const output = getStdout(codecovCmd);
  const viewReportPrefix = 'View report at: ';
  const viewReport = output.match(`${viewReportPrefix}.*`);
  if (viewReport && viewReport.length > 0) {
    log(green('INFO:'), 'Uploaded', cyan(file));
  } else {
    log(
      yellow('WARNING:'),
      'Code coverage report upload may have failed:\n',
      yellow(output)
    );
  }
}

/**
 * Uploads code coverage reports for unit / integration tests during CI builds.
 * @return {Promise<void>}
 */
async function codecovUpload() {
  if (!isCiBuild()) {
    log(
      yellow('WARNING:'),
      'Code coverage reports can only be uploaded by CI builds.'
    );
    return;
  }

  const commitSha = shortSha(ciBuildSha());
  log(
    green('INFO:'),
    'Uploading coverage reports to',
    cyan(`https://codecov.io/gh/ampproject/amphtml/commit/${commitSha}`)
  );

  Object.entries(COVERAGE_REPORTS)
    .filter(([, reportFile]) => fs.existsSync(reportFile))
    .forEach(([testType, reportFile]) => uploadReport(reportFile, testType));
}

module.exports = {
  codecovUpload,
};

codecovUpload.description =
  'Upload code coverage reports to codecov.io during CI';
