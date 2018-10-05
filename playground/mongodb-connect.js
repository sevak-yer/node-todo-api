//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID;
// console.log(obj);


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    db.collection('Users').insertOne({
        name: 'Andrew',
        age: 25,
        location: 'Philadelphia' 
     }, (err, result) => {
         if (err) {
             return console.log('Unable to insert todo', err);
         }
         console.log(result.ops[0]._id.getTimestamp());
     });
    
    // db.collection('Todos').insertOne({
    //    text: 'running',
    //    completed: false 
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    db.close();
});
 