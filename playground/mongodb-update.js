//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

//    db.collection('Todos').findOneAndUpdate({
//        _id: new ObjectID('5bb799bb6d967b08ec122942')
//    }, {
//        $set: {
//            completed: true
//        }
//    }, {
//        returnOriginal: false
//    }).then((result) => {
//         console.log(result);
//    });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bb79b3c82d5e01e0c690da5')
    },{
        $set: {
            name: 'Karen'
        },
        $inc: {
            age: 1
        }
    }, {
        returnOriginal: false
    }).then ((result) => {
        console.log(result);
    });

    // db.close();
});
 