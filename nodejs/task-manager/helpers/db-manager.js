const mongoose = require('mongoose');
const connectionString =
//  'mongodb://node:node@ds131729.mlab.com:31729/node-db-test'
// 'mongodb://mike:mike@ds121349.mlab.com:21349/events-manager';
'mongodb://michele:michele2019@ds163054.mlab.com:63054/task-manager'

function connect() {
    mongoose.connect(connectionString, err => {
        if (err) {
            console.error('Error connection MongoDB: ' + err);
        } else {
            console.error('MongoDB is connected');
        }
    });
}

const db = {
    connect
}
module.exports = db;