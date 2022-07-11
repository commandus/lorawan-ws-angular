const host = 'http://84.237.104.128:5002/';
export const config = {
  endpoint: {
    token: {
      url: host + 'token'
    },
    raw: {
      url: host + 'raw'
    },
    t: {
      url: host + 't'
    },
    raw_id: {
      url: host + 'raw-id'
    },
    t_id: {
      url: host + 't-id'
    },
    raw_count: {
      url: host + 'raw-count'
    },
    t_count: {
      url: host + 't-count'
    },
    gateways: {
      url: host + 'gateways'
    },
    passport: {
      url: host + 'passport'
    },
    passport_count: {
      url: host + 'passport-count'
    },
    passportFile: {
      url: host + 'passport-file'
    }
  }
};
