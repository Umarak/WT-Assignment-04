module.exports = {
    PORT: process.env.PORT,

    /** DATABASE */
    db: {
        DB_URL: process.env.DB_URL,

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

};