const express = require('express');
const { sequelize, Users } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cors(corsOptions));


app.post('/api_register', (req, res) => {

    const obj = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        //obican user
        role: 'user',
    };

    Users.create(obj).then( rows => {
        
        const usr = {
            userId: rows.id,
            user: rows.name,
            role: rows.role
        };

        const token = jwt.sign(usr, process.env.ACCESS_TOKEN_SECRET);

        console.log(token);
        
        res.json({ token: token });

    }).catch( err => res.status(500).json(err) );
});

app.post('/api_login', (req, res) => {

    Users.findOne({ where: { email: req.body.email } })
        .then( usr => {

            if (bcrypt.compareSync(req.body.password, usr.password)) {
                const obj = {
                    userId: usr.id,
                    user: usr.email,
                    role: usr.role
                };
        
                const token = jwt.sign(obj, process.env.ACCESS_TOKEN_SECRET);
                
                res.json({ token: token });
            } else {
                res.status(400).json({ msg: "Invalid credentials"});
            }
        })
        .catch( err => res.status(500).json(err) );
});

app.listen({ port: process.env.PORT || 9000 }, async () => {
    console.log("auth_app started.");
    await sequelize.authenticate();
});