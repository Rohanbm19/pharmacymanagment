class RedisService {
  constructor(client) {
    this.client = client;
  }

  async set(key, value) {
    return this.client.set(key, value);
  }

  async get(key) {
    return this.client.get(key);
  }
}

module.exports = RedisService;
