import Ember from 'ember';
import config from 'travis/config/environment';

export default Ember.Controller.extend({
  queryParams: ['org'],
  filter: null,
  org: null,

  filteredRepositories: Ember.computed('filter', 'model', 'org', function () {
    let filter, org, repos;
    filter = this.get('filter');
    repos = this.get('model');
    org = this.get('org');
    repos = repos.filter(item => item.get('currentBuild') !== null).sort((a, b) => {
      if (a.currentBuild.finished_at === null) {
        return -1;
      }
      if (b.currentBuild.finished_at === null) {
        return 1;
      }
      if (a.currentBuild.finished_at < b.currentBuild.finished_at) {
        return 1;
      }
      if (a.currentBuild.finished_at > b.currentBuild.finished_at) {
        return -1;
      }
      if (a.currentBuild.finished_at === b.currentBuild.finished_at) {
        return 0;
      }
    });

    if (org) {
      repos = repos.filter(item => item.get('owner.login') === org);
    }
    if (Ember.isBlank(filter)) {
      return repos;
    } else {
      return repos.filter(item => item.slug.match(new RegExp(filter)));
    }
  }),

  updateFilter() {
    let value;
    value = this.get('_lastFilterValue');
    this.transitionToRoute({
      queryParams: {
        filter: value
      }
    });
    return this.set('filter', value);
  },

  selectedOrg: Ember.computed('org', 'orgs.[]', function () {
    return this.get('orgs').findBy('login', this.get('org'));
  }),

  orgs: Ember.computed(function () {
    let apiEndpoint, orgs;
    orgs = Ember.ArrayProxy.create({
      content: [],
      isLoading: true
    });
    apiEndpoint = config.apiEndpoint;
    Ember.$.ajax(`${apiEndpoint}/v3/orgs`, {
      headers: {
        Authorization: `token ${this.auth.token()}`
      }
    }).then(response => {
      let array;
      array = response.organizations.map(org => Ember.Object.create(org));
      orgs.set('content', array);
      return orgs.set('isLoading', false);
    });
    return orgs;
  }),

  actions: {
    updateFilter(value) {
      this.set('_lastFilterValue', value);
      return Ember.run.throttle(this, this.updateFilter, [], 200, false);
    },

    selectOrg(org) {
      let login;
      login = org ? org.get('login') : null;
      return this.set('org', login);
    }
  }
});
