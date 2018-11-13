require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate.js')

const {ObjectID} = require('mongodb');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    }); 
    
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
            res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// app.get('/todos/:id',(req, res) => {
//     var id = req.params.id;

//     if (!ObjectID.isValid(id)) {
//         return res.status(404).send('invalid ID');
//     }
//     Todo.findById(id).then((todo) => {
//         if (todo) {
//             return res.send({todo});
//         }
//         res.status(404).send('todo not found');
//     }, (e) => {
//         res.status(400).send('error');
//     });
// });

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('invalid ID');
    }
    Todo.findOne({_id:id, _creator:req.user._id}).then((todo) => {
        if (todo) {
            return res.send({todo});
        }
        res.status(404).send('todo not found');
    }, (e) => {
        res.status(400).send('error');
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid ID');
    }
    Todo.findOneAndRemove({
        _id: id, 
        _creator: req.user._id
    }).then((todo) => {
        if (todo) {
            return res.status(200).send({todo});
        } 
        res.status(404).send('todo not found');
    }, (e) => {
        res.status(400).send('error');
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({_id:id,_creator: req.user._id},{$set: body}, {new: true},).then((todo) => {
        if (!todo) {
            return res.status(404).send('todo not found');
        }
        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({users});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    var user = new User (body
    //     {
    //     email: body.email,
    //     password: body.password
    // }
    );
    user.save().then((/*doc*/) => {
        // res.send(doc);
        return user.generateAuthToken();

    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send('user login or password incorrect')
    }); 
});

app.listen(port, () => {
    console.log(`Started up on port ${port}`); 
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

module.exports = {app};

