const mysql = require('mysql');
const bcrypt = require('bcrypt');
var fs = require('fs');
// Connection Pool
let db = mysql.createConnection({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: 'utf8mb4',
});

// date_format
exports.Date_format = function(date) {
    const mydate = new Date(date); // Create a new Date object based on the input
    if (isNaN(mydate.getTime())) { // Check if the date is valid
        return 'Invalid date';
    }
    const yyyy = mydate.getFullYear();
    let mm = mydate.getMonth() + 1; // Months start at 0!
    let dd = mydate.getDate();
    // if
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    // result
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    // return back
    return formattedToday;
}

// count total rows from table
exports.countTotalRows = function(tableName) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT COUNT(*) FROM ${tableName}`;

        if (tableName != `white_list`)
            sql += ` WHERE status = 'active';`

        db.query(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]['COUNT(*)']);
            }
        });
    });
}

exports.checkPhoneList = function(phone_number) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM white_list WHERE phone_number = ?`;
        db.query(sql, [phone_number], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
}

exports.checkPhoneCustomer = function(phone_number) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM customer WHERE phone_number = ?`;
        db.query(sql, [phone_number], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
}

exports.checkIC = function(IC) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM customer WHERE IC = ?`;
        db.query(sql, [IC], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
}

exports.checkEmail = function(email) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM customer WHERE email = ?`;
        db.query(sql, [email], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
}

exports.checkApp_id_number = function(app_id_number) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM customer WHERE app_id_number = ?`;
        db.query(sql, [app_id_number], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
}

exports.saveNewCustomer = function(first_name, last_name, IC, DOB, phone_number, email, app_id_number) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO customer (first_name, last_name, IC, DOB, phone_number, email, app_id_number) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertData = [first_name, last_name, IC, DOB, phone_number, email, app_id_number];
        db.query(sql, insertData, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Number of salt rounds to use
const saltRounds = 10;

// Function to hash a password
exports.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

// Function to compare a plaintext password with a hash
exports.comparePassword = async function(plaintextPassword, hash) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

// save userData to actionsLog.log
exports.actionsLog = async function(action, staffName, ip, details) {

    let data = await { "Action": action, "staffName": staffName, "IP": ip, "timeActions": Date(), "Details": details }
    data = JSON.stringify(data) + '\n';

    fs.appendFile('actionsLog.log', data, function(err) {
        if (err) {
            console.error(err)
        }
    })

}