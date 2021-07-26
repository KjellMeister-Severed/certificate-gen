"use strict";
const mysql = require("mysql");

let pool = mysql.createPool({
    connectionLimit: 10,
    host: "ID321707_qrgen.db.webhosting.be",
    port: 3306,
    database: "ID321707_qrgen",
    user: "ID321707_qrgen",
    password: "Kjell007!"
});

function row2user(row) {
    if (row.id === null){
        throw new Error("Interaction could not be completed")
    }else {
        return {
            username: row.username,
            password: row.password,
            riziv: row.riziv,
            name: row.realname
        }
    }
}

function addNewUser(user, cb) {
    pool.getConnection(function (err, connection) {
        let query = `INSERT INTO users (username,password, riziv, realname) VALUES('${user.username}','${user.password}', '${user.riziv}', '${user.realname}');`
        connection.query(query, function (err) {
            connection.release()
            if (err) cb(err)
            else cb(user)
        })
    })
}

function getUserByName(userName, cb) {
    pool.getConnection(function (err, connection) {
        connection.query(`SELECT * FROM users WHERE username like '${userName}'`, function (err, rows) {
            connection.release();
            if (err) console.log(err);
            else {
                if (rows.length < 1){
                    cb(new Error("User not found"))
                }else {
                    cb(err, rows.map(row2user))
                }
            }
        })
    })
}



module.exports = {
getUserByName, addNewUser
}