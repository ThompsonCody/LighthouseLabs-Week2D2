"use strict";

const express = require('express'),
      app = express(),
      bodyParser = require("body-parser");

let PORT = process.env.PORT || 8080;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.set('view engine', 'ejs');

let urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get('/hello', (res, req) => {
  res.end("<html><body>Hello <b>World</b></body></html>");
});

app.get('/urls', (req, res) =>{
  let templateVars = {urls : urlDB};
  // var data = urlDB;
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) =>{
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {shortURL: req.params.id,
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
  console.log(req.body); // debugger to see POST params
  res.send("Ok");        // respond with 'ok'
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




function generateRandomString(){
    let text = " ";
    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ ){
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
}
