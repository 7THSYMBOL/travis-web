import { test } from 'qunit';
import moduleForAcceptance from 'travis/tests/helpers/module-for-acceptance';
import jobPage from 'travis/tests/pages/job';

moduleForAcceptance('Acceptance | jobs/restart', {
  beforeEach() {
    const currentUser = server.create('user');
    signInUser(currentUser);
  }
});

test('restarting job', function (assert) {
  let repo =  server.create('repository', { slug: 'travis-ci/travis-web' });
  // create branch
  server.create('branch', {});
  let commit = server.create('commit', { author_email: 'mrt@travis-ci.org', author_name: 'Mr T', committer_email: 'mrt@travis-ci.org', committer_name: 'Mr T', branch: 'acceptance-tests', message: 'This is a message', branch_is_default: true });
  let build = server.create('build', { repository_id: repo.id, state: 'failed', commit_id: commit.id, commit });
  let job = server.create('job', { number: '1234.1', repository_id: repo.id, state: 'failed', build_id: build.id, commit, build });
  commit.job = job;

  job.save();
  commit.save();

  // create log
  server.create('log', { id: job.id });

  jobPage
    .visit()
    .restartJob();

  andThen(function () {
    assert.equal(jobPage.restartedNotification, 'The job was successfully restarted.', 'restarted notification should display proper job restarted text');
  });
});
