 const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');  

const todos = [{
    _id: new ObjectID(),
    text: 'first test todo'
}, {
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: '333'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
       return Todo.insertMany(todos);
    }).then(() => done());    
});

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