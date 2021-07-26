"use strict";
const mysql = require("mysql");
const fetch = require("node-fetch")

let pool = mysql.createPool({
    connectionLimit: 10,
    host: "ID321707_qrgen.db.webhosting.be",
    port: 3306,
    database: "ID321707_qrgen",
    user: "ID321707_qrgen",
    password: "Kjell007!"
});

function addcoupon(info, cb){
    fetch("https://covidtestcenter.be/wp-json/wc/v3/coupons", {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `${process.env.WC_API_TOKEN}`
        },
        body: JSON.stringify(
            {
                code: info.id,
                discount_type: "fixed_cart",
                amount: "2",
                individual_use: true,
                exclude_sale_items: true,
                minimum_amount: "0",
                maximum_amount: null,
                description: info.mail + " | " + info.banknr + " | " + info.telNr
            }
        ),
    })
        .then(response => response.json())
        .then(data => cb(data))
        .catch(err => console.log(err))
}

module.exports = {
    addcoupon
}