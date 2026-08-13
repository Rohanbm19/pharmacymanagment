const { createClient } = require("redis");

function createStubClient() {
    const noop = async () => null;
    return {
        isOpen: false,
        on: () => {},
        connect: async () => {},
        get: noop,
        setEx: async () => {},
        del: async () => {}
    };
}

let redisClient;

// Only enable Redis if USE_REDIS=true to avoid noisy errors when Redis isn't installed locally.
if (process.env.USE_REDIS !== 'true') {
    console.log('USE_REDIS != true — skipping Redis and using stub client');
    redisClient = createStubClient();
} else if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set — using stub redis client');
    redisClient = createStubClient();
} else {
    redisClient = createClient({ url: process.env.REDIS_URL, socket: { reconnectStrategy: false } });

    redisClient.on("error", (err) => {
        console.log("Redis Error:", err);
    });

    (async () => {
        try {
            await redisClient.connect();
            console.log("Redis Connected");
        } catch (err) {
            console.log("Redis Connection Failed:", err.message);
            // replace with stub to avoid repeated connection attempts
            redisClient = createStubClient();
        }
    })();
}

module.exports = redisClient;