require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const {ObjectID} = require('mongodb');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('invalid ID');
    }
    Todo.findById(id).then((todo) => {
        if (todo) {
            return res.send({todo});
        }
        res.status(404).send('todo not found');
    }, (e) => {
        res.status(400).send('error');
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid ID');
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if (todo) {
            return res.status(200).send({todo});
        } 
        res.status(404).send('todo not found');
    }, (e) => {
        res.status(400).send('error');
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid ID');
    }

    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().toString();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id,{$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send('todo not found');
        }
        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Started up on port ${port}`); 
});

module.exports = {app};