const host = window.location.origin + '/';
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
    devices: {
      url: host + 'devices'
    },
    passport: {
      url: host + 'passport'
    },
    passport_count: {
      url: host + 'passport-count'
    },
    passportFile: {
      url: host + 'passport-file'
    },
    about: {
      url: host + 'about'
    },
    config: {
      url: host + 'config'
    },
    dbs: {
      url: host + 'databases'
    },
    plan: {
      url: host + 'plans'
    },
    statdevice: {
      url: host + 'device-stat'
    },
    statgw: {
      url: host + 'gateway-stat'
    }
  }
};
