var mysql = require("mysql2");

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'adev',
    database: 'animal_adoption'
});

connection.connect(error => {
    if (error) {
        console.log("Database connection failed:", error);
    } else {
        console.log("Connected to MySQL database");
    }
});

module.exports = connection;