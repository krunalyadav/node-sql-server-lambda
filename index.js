var express = require('express');
var app = express();

var sql = require("mssql");
const http = require('http');
var async = require('async');

exports.handler = function index(event, context, callback) {
    try {
        var connection = new sql.Connection({
            user: 'sa',
            password: 'test#123',
            server: '54.86.239.59',
            database: 'SchoolDB'
        });

        connection.connect(function (err) {
            if (err) console.log(err);
            else {
                console.log("Connection Established");
            }
        });
        var transaction = new sql.Transaction(connection);

        transaction.begin(function (err) {
            http.get('http://jsonplaceholder.typicode.com/posts', function (response) {

                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('end', function () {
                    //   JSON.parse(body).forEach(function (item) {
                    //     connection.query('INSERT INTO test set ?', { userid: item.userId, id: item.id, title: item.title, body: item.body }, function (err, result) {
                    //       if (err) console.log(err);
                    //     })
                    //   });
                    //   context.succeed();
                    console.log('executioin started');

                    var data = JSON.parse(body);

                    async.each(data, function (item, cb) {
                        var request = new sql.Request(transaction);
                        request.query("INSERT INTO test (userId, id, title, body) values ( " + item.userId + "," + item.id + ",'" + item.title + "','" + item.body + "')", function (err, result) {
                            if (err) console.log(err);
                            cb(null);
                        })
                    }, function (err) {
                        if (err) console.log(err);
                        transaction.commit(function (err, recordset) {
                            // ... error checks
                            if (err) {
                                console.log(err);
                                context.callbackWaitsForEmptyEventLoop = false;
                                callback('Fail Object', 'Failed result');
                            }
                            else {
                                console.log("Transaction committed.");
                                //callback(null, 'Success message');
                            }
                        });
                    });
                });
            });
        });


        // connect to your database
        // sql.connect(config, function (err) {

        //     if (err) console.log(err);

        //     // create Request object
        //     var request = new sql.Request();

        //     // query to the database and get the records
        //     request.query('select * from test', function (err, recordset) {

        //         if (err) console.log(err)

        //         // send records as a response
        //         res.send(recordset);

        //     });
        // });
    }
    catch (ex) {
        console.log(ex);
    }
}