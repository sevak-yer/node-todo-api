const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require ('./../server/models/todo.js');
const {User} = require('./../server/models/user.js')

// var id = '5bbe76831d12f81950c0e221';

// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Todo.find({_id: id}).then((todos) => {
//     console.log(todos)
// });

// Todo.findOne({_id: id}).then((todo) => {
//     console.log(todo)
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found');
//     }
//     console.log('todo by ID: ',todo)
// }).catch((e) => {
//      console.log(e);
// });

var id = '5bbf656c815764a3b7d21e15';

User.findById({_id: id}).then((user) => {
    if (!user) {
        return console.log('User not found.')
    }
    console.log(user);
}, (e) => {
    console.log(e);
});

