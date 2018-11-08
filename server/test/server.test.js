const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');  
const {User} = require('./../models/user.js')
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

// beforeEach((done) => {
//     Todo.remove({}).then(() => {
//        done();    
//     });
// });

describe('POST /todos', () => { 
    it('should create a new todo', (done) => {
        var text = 'test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }               

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => {
                    done(e);
                });  
            }); 
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect ((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID;
        request(app) 
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe('todo not found');
            })
            .end(done);  
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe('invalid ID');
            })
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var id = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id)
            })
            
            .end((err, res) => {
                if (err) {
                   return done(err);
                }
                Todo.findById(id).then((res) => {
                    expect(res).toBeFalsy();
                    done();
                }).catch((e) => {
                    done(e);
                });
                
            });
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID;
        request(app) 
            .delete(`/todos/${id.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe('todo not found');
            })
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe('Invalid ID');
            })
            .end(done);
    });
});

describe('PATCH/ todos/:id', () => {
    it('should update the todo', (done) => {
        var completed = true;
        var text = 'first test todo UPDATED'
        var id = todos[0]._id.toHexString();
        request(app)
            .patch(`/todos/${id}`)
            .send({completed})
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(true)
                })    
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.findById(id).then((res) => {
                    expect(typeof res.completedAt).toBe('string');
                    done();
                }).catch((e) => {
                    done(e); 
                });
                
            });
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var completed = false;
        var text = 'second test todo UPDATED'
        var id = todos[1]._id.toHexString();
        request(app)
            .patch(`/todos/${id}`)
            .send({completed})
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(false)
                })    
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.findById(id).then((res) => {
                    expect(res.completedAt).toBe(null);
                    done();
                }).catch((e) => {
                    done(e);
                });
                
            });
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var user = {
            email: 'Test@gmat.com',
            password: 'lolopi'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(200)
            .expect ((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(user.email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email:user.email}).then((doc) => {
                    expect(doc).toExist();
                    expect(doc.password).toNotBe(user.password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation error if request invalid',  (done) => {
        var user = {
            email: 'Test',
            password: 'lopi'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .end(done);
    });

    it('should not creat user if email in use', (done) => {
        var user = {
            email: users[0].email,
            password: 'lolopi'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
         .post('/users/login')
         .send({
            email: users[1].email,
            password: users[1].password  
         })
         .expect(200)
         .expect((res) => {
             expect(res.headers['x-auth']).toExist();
         })
         .end((err, res) => {
             if (err) {
                 return done(err);
             }
             User.findById(users[1]._id).then((user) => {
                expect(user.tokens[0]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
             }).catch((e) => {done(e)});
         });
    });

    it ('should reject invalid login', (done) => {
        request(app)
         .post('/users/login')
         .send({
            email: users[1].email,
            password: 123456789 
         })
         .expect(400)
         .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.text).toBe('user login or password incorrect');
         })
         .end((err, res) => {
             if (err) {
                 return done(err);
             }
             User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => {done(e)});
         });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done()
            }).catch((e) => {
                done(e);
            });
        })
    });
});


 