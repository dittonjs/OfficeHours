// Import libraries
const oauth = require('oauth-signature');
const _ = require("lodash");

class Validator {
  constructor(config = {}) {

    // Verify and save consumer credentials
    if (!config.consumer_secret) {
      throw new Error('Validator requires consumer_secret');
    }
    this.consumer_secret = config.consumer_secret;
    if (!config.consumer_key) {
      throw new Error('Validator requires consumer_key');
    }
    this.consumer_key = config.consumer_key;
  }

  isValid(req) {
    if (
      !req.body
      || !req.body.oauth_consumer_key
      || req.body.oauth_consumer_key !== this.consumer_key
    ) {
      return false;
    }
    return this._isSignatureValid(req);
  }

  _isSignatureValid(req) {
    const originalUrl = req.originalUrl || req.url;
    if (!originalUrl) {
      return false;
    }

    // todo this will fail with query params!
    const url = 'https://' + req.headers.host + originalUrl;
    const body = _.clone(req.body);
    delete body.oauth_signature;

    const generatedSignature = decodeURIComponent(
      oauth.generate(
        req.method,
        url,
        body,
        this.consumer_secret
      )
    );
    return (generatedSignature === req.body.oauth_signature);
  }
}

module.exports = Validator;
