import Ember from 'ember';
import config from 'travis/config/environment';
import RESTAdapter from 'ember-data/adapters/rest';

const { service } = Ember.inject;

export default RESTAdapter.extend({
  auth: service(),
  host: config.apiEndpoint,

  sortQueryParams: false,
  coalesceFindRequests: false,
  headers: {
    'Travis-API-Version': '3',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },

  ajaxOptions() {
    const hash = this._super(...arguments);

    hash.headers = hash.headers || {};

    let token = this.get('auth').token();
    if (token) {
      hash.headers['Authorization'] = `token ${token}`;
    }

    return hash;
  },

  // TODO: I shouldn't override this method as it's private, a better way would
  // be to create my own URL generator
  _buildURL(modelName, id) {
    let url = [];
    const host = Ember.get(this, 'host');
    const prefix = this.urlPrefix();
    let path;

    if (modelName) {
      path = this.pathForType(modelName, id);
      if (path) { url.push(path); }
    }

    if (id) { url.push(encodeURIComponent(id)); }
    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url && url.charAt(0) !== '/') {
      url = `/${url}`;
    }

    return url;
  },

  pathForType(modelName, id) {
    const underscored = Ember.String.underscore(modelName);
    return id ? underscored :  Ember.String.pluralize(underscored);
  },

  // this can be removed once this PR is merged and live:
  // https://github.com/emberjs/data/pull/4204
  findRecord(store, type, id, snapshot) {
    return this.ajax(this.buildURL(type.modelName, id, snapshot, 'findRecord'), 'GET');
  }
});
