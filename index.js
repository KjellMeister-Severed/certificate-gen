"use strict";

const http = require("http");
require('dotenv').config();
const fetch = require("node-fetch")
const express = require("express");
const bcrypt = require('bcrypt');
const cors = require('cors')
const app = express();
const udata = require("./udata.js")
const cdata = require("./cdata.js")
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const server = http.createServer(app)
let port = process.env.PORT || 8888;
let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 201
}
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors(corsOptions));

app.post("/login", (req, res) => {
    udata.getUserByName(req.body.username, async (err, user) => {
        if (err) {
            res.status(401).end(JSON.stringify({
                loginOk: false
            }))
        } else {
            try {
                if (await bcrypt.compare(req.body.password, user[0].password)) {
                    console.log(user[0])
                    res.status(201).end(JSON.stringify({
                        username: req.body.username,
                        realname: user[0].name,
                        riziv: user[0].riziv,
                        jwt: jwt.sign(user[0], process.env.ACCESS_TOKEN_SECRECY),
                        loginOk: true
                    }))
                } else {
                    res.status(401).end(JSON.stringify({
                        loginOk: false
                    }))
                }
            } catch (e) {
                console.log(e)
                res.status(500).end()
            }
        }
    })
})

app.post("/register", authToken, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            username: req.body.name,
            password: hashedPassword,
            riziv: req.body.riziv,
            realname: req.body.realname
        }
        udata.addNewUser(user, (user, err) => {
            console.log(user)
            if (err) console.log(err)
            else res.status(201).end(JSON.stringify({jwt: jwt.sign(user, process.env.ACCESS_TOKEN_SECRECY)}))
        })
    } catch (e) {
        res.status(500).end()
    }
})

app.post("/coupon/:id", authToken, (req, res) => {
    cdata.addcoupon({
        id: req.params.id,
        mail: req.body.couponInfo.email,
        banknr: req.body.couponInfo.bankNr,
        telNr: req.body.couponInfo.telephone
    }, cb => {
        if (cb.data === undefined) {
            console.log(req.body.couponInfo)
            fetch(`https://sys.bitpc.be/websvc/tris/w_comm.php?req_type=add_poster_job_by_webreq&mailto=${req.body.couponInfo.email}&code=${req.params.id}`, {
                method: 'GET'
            }).then()
            res.status(201).end(JSON.stringify({status: 201}))
        } else {
            res.status(400).end(JSON.stringify({status: 400}))
        }
    })
})


//--------------------------------//
//          Middleware            //
//--------------------------------//
function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRECY, (err, user) => {
        if (err) console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

server.listen(port)