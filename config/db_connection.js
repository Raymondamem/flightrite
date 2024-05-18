require('dotenv').config();
const mysql = require('mysql2');

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

try {
    connection.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Database connected!");
    });
} catch (error) {
    console.log(`Error connecting to db! ${error}`);
}

module.exports = connection;
