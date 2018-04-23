const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/profiles";
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

app.use(session({ secret: 'example' }));

app.use(bodyParser.urlencoded({
  extended: true
}))
// set the view engine to ejs
app.set('view engine', 'ejs');

var db;

MongoClient.connect(url, function(err, database) {
  if (err) throw err;
  db = database;
  app.listen(8080);
  console.log('listening on 8080');
});

//root route
app.get('/', function(req, res) {
  res.render('index');
});
//login route
app.get('/login', function(req, res) {
  res.render('login');
});
//about route
app.get('/about', function(req, res) {
  res.render('about');
});
//log out route
app.get('/logout', function(req, res) {
  req.session.loggedin = false;
  req.session.destroy();
   console.log('logged out');
  res.redirect('/');
});



app.post('/dologin', function(req, res) {
  console.log(JSON.stringify(req.body))
  var uname = req.body.username;
  var pword = req.body.password;

  db.collection('people').findOne({"username":uname}, function(err, result) {
    if (err) throw err;//if there is an error, throw the error
    //if there is no result, redirect the user back to the login system as that username must not exist
    if(!result){res.redirect('/login');return}
    //if there is a result then check the password, if the password is correct set session loggedin to true and send the user to the index
    if(result.password == pword){ req.session.loggedin = true; res.redirect('/'); console.log('logged in')}
    //otherwise send them back to login
    else{res.redirect('/login')}
  });
});


app.post('/login', function(req, res) {
  //we create the data string from the form components that have been passed in

var datatostore = {
"name":req.body.username,
 "email":req.body.email,
  "password":req.body.password}



//once created we just run the data string against the database and all our new data will be saved/
  db.collection('people').save(datatostore, function(err, result) {
    if (err) throw err;
    console.log('saved to database')
    //when complete redirect to the index
    res.redirect('/')
  })
});
