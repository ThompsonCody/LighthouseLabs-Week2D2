"use strict";

const express = require('express'),
      app = express(),
      bodyParser = require("body-parser"),
      // cookieSession = require("cookie-session");
      cookieParser = require("cookie-parser")

let PORT = process.env.PORT || 8080;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser())

app.set('view engine', 'ejs');

let urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//--------------------------------------------//


function generateRandomString(){
    let text = " ";
    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ ){
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}

function emailTaken(email){
  let flag = false;
  for(let key in users){
    if(users[key].email === email) {
      flag = true;
    }
  }
  return flag;
}
function findUser(email){
  // let user = false;
  for(let key in users){
    if(users[key].email === email) {
      console.log('this,\ user -> ', users[key]);
      return users[key];
      //here, do you want to just return the matchig user object, if user is found? Or is that in the login route
      // console.log('yo');
    }
  }
}



//---------------------------------------------//

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get('/hello', (res, req) => {
  res.end("<html><body>Hello <b>World</b></body></html>");
});

app.get('/urls', (req, res) =>{
  let templateVars = {urls : urlDB, user_id: req.cookies["user_id"]};
  // var data = urlDB;
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) =>{
  res.render("urls_new");
  let templateVars = {user_id: req.cookies["user_id"]};
});


//----******** REGISTER ROUTE ************----


app.get('/urls/register', (req, res) =>{
  // let templateVars = {user_id: req.cookies["user_id"]};
  // res.render("urls_register", templateVars);
  const user = users[req.cookies["user_id"]];
  let templateVars = { urls: users, user: user };
  res.render("urls_register", templateVars);
});


app.post("/urls/register", (req,res) => {
  let email = req.body.email,
        pw = req.body.password,
        user_id = generateRandomString();
        // console.log("roihit dhand");
        // console.log(email, pw, user_id);

  if (!(email && pw) || !pw || !email) {
    return res.status(400).render('urls_register', {
      error: 'email or password not manifested'
    });
  }
  // console.log("email value ",email);
  if (emailTaken(email)) {
    // console.log("email already taken");
    return res.status(400).render('urls_register', {
      error: 'email already here, but not here here, somewhere there'
    });
  } else {
    // console.log("email not taken");

    users[user_id] = {
      id: user_id,
      email: email,
      password: pw
    };
    // console.log("all users");
    // console.log(users);
    // users[user_id] = user;
    res.cookie('user_id', user_id);
    res.redirect('/urls/');
  }

});


//------------**************** LOGIN ROUTE ****************------------


app.get('/login', (req, res) =>{
  // let templateVars = {};
  res.render("urls_login");
});

app.post('/login', (req, res) =>{
  let email = req.body.email,
        pw = req.body.password;

  let user = findUser(email);
  console.log(findUser(email));

  if (user) {
    if (pw === user.password) {
      res.cookie("user_id",user.id);
      res.redirect('/urls');
    } else if(user.password !== pw){
       res.status(403).render("urls_login", {
        error: "incorrect email my G"
      });
    }else {
      res.status(403).render("urls_login", {
        error: "that be an incorect email my partner"
      });
    }
  }
});


//--------************ LOGOUT ROUTE  *************----------------


app.post('/logout', (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get('/urls/:id', (req, res) => {
  let templateVars = {user_id: req.cookies["user_id"],
                      shortURL: req.params.id,
                      longURL: urlDB[req.params.id]};
  res.render('urls_show', templateVars);
});

//CLick short redirect to full url
app.get('/u/:shortURL', (req,res) => {
  let shortURL = req.params.shortURL,
      longURL = urlDB[shortURL]; //

  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDB);
});


// ----DELETE----
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDB[id];
  res.redirect("/urls");
});

// ----UPDATE LONGURL THAT SHORT ID POSTS TO----
app.post('/urls/:id/update', (req, res) => {
  let id = req.params.id,
      longURL = req.body.update;

  urlDB[id] = longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDB[shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

