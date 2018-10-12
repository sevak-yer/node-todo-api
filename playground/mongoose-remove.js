const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require ('./../server/models/todo.js');
const {User} = require('./../server/models/user.js')


// Todo.remove({}).then((result) => {
//     console.log(result);
// });

Todo.findByIdAndRemove('5bc0f5d1d63d534211e64385', (e, todo) => {
    console.log(todo);
    
});