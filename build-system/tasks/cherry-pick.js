'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {cyan, green, red, yellow} = require('kleur/colors');
const {execOrThrow} = require('../common/exec');
const {getOutput} = require('../common/process');
const {log} = require('../common/logging');

/**
 * Determines the name of the cherry-pick branch.
 *
 * @param {string} version
 * @param {number} numCommits
 * @return {string}
 */
function cherryPickBranchName(version, numCommits) {
  const timestamp = version.slice(0, -3);
  const suffixNumber = Number(version.slice(-3)) + numCommits;
  const suffix = String(suffixNumber).padStart(3, '0');
  return `amp-release-${timestamp}${suffix}`;
}

/**
 * Updates tags from the remote and creates a branch at the release commit.
 *
 * @param {string} ref
 * @param {string} branch
 * @param {string} remote
 */
function prepareBranch(ref, branch, remote) {
  log(green('INFO:'), 'Pulling latest from', cyan(remote));
  execOrThrow(
    `git pull ${remote}`,
    `Failed to pull latest from remote ${cyan(remote)}`
  );

  execOrThrow(
    `git checkout -b ${branch} ${ref}`,
    `Failed to checkout new branch at ref ${cyan(ref)}`
  );
}

/**
 * Cherry-picks a commit into a new branch. When the cherry-pick succeeds,
 * returns `true`. In the event of a merge conflict, the cherry-pick is aborted
 * and an error is thrown.
 *
 * @param {string} sha
 */
function performCherryPick(sha) {
  try {
    log(green('INFO:'), 'Cherry-picking commit', cyan(sha));
    execOrThrow(
      `git cherry-pick -x ${sha}`,
      `Failed to cherry-pick commit ${cyan(sha)}; aborting`
    );
  } catch (e) {
    log(green('INFO:'), 'Aborting cherry-pick of commit', cyan(sha));
    getOutput(`git cherry-pick --abort`);
    throw e;
  }
}

/**
 * @return {Promise<void>}
 */
async function cherryPick() {
  const {push, remote = 'origin'} = argv;
  const commits = (argv.commits || '').split(',').filter(Boolean);
  let onto = String(argv.onto || '');

  if (!commits.length) {
    throw new Error('Must provide commit list with --commits');
  }
  if (!onto) {
    throw new Error('Must provide 13-digit AMP version with --onto');
  }
  if (onto.length === 15) {
    log(
      yellow('WARNING:'),
      'Expected a 13-digit AMP version but got a 15-digit RTV;',
      'ignoring channel prefix'
    );
    // Be forgiving if someone provides a version instead of a full RTV.
    onto = onto.substr(2);
  }
  if (onto.length !== 13) {
    throw new Error('Expected 13-digit AMP version');
  }

  const branch = cherryPickBranchName(onto, commits.length);
  try {
    prepareBranch(onto, branch, remote);
    commits.forEach(performCherryPick);

    if (push) {
      log(
        green('INFO:'),
        'Pushing branch',
        cyan(branch),
        'to remote',
        cyan(remote)
      );
      execOrThrow(
        `git push --set-upstream ${remote} ${branch}`,
        `Failed to push branch ${cyan(branch)} to remote ${cyan(remote)}`
      );
    }

    log(
      green('SUCCESS:'),
      `Cherry-picked ${commits.length} commits onto release ${onto}`
    );
  } catch (e) {
    log(red('ERROR:'), e.message);
    log('Deleting branch', cyan(branch));
    getOutput(`git checkout main && git branch -d ${branch}`);
    throw e;
  }
}

module.exports = {cherryPick};

cherryPick.description = 'Cherry-pick one or more commits onto a new branch';
cherryPick.flags = {
  'commits': 'Comma-delimited list of commit SHAs to cherry-pick',
  'push': 'If set, push the created branch to the remote',
  'remote': 'Remote ref to refresh tags from (default: origin)',
  'onto': '13-digit AMP version to cherry-pick onto',
};
