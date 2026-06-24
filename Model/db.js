const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 30000,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
async function testConnection() {
    try {
        const [result] = await pool.query('SELECT 1');
        console.log('✅ Database Connected Successfully');
        return true;
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        console.error('   Host:', process.env.DB_HOST);
        console.error('   Port:', process.env.DB_PORT);
        console.error('   Database:', process.env.DB_NAME);
        return false;
    }
}

// Run the test when the file loads
testConnection();

// Export the pool directly (it already supports promises)
module.exports = pool;