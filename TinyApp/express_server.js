
const express = require('express'),
      app = express(),
      bodyParser = require("body-parser"),
      cookieSession = require("cookie-session");
      bcrypt = require('bcrypt');

let PORT = process.env.PORT || 8080;

// --- Configuration
app.set('view engine', 'ejs');
const saltRounds = 10;

// --- Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Cody'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// --- database for URLS
let urlDB = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: '1',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: '2',
  },
};

// --- User database
let users = {
  1: {
    id: '1',
    email: 'user@example.com',
    password: 'p',
  },
  2: {
    id: '2',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

//---------******** Functions ********---------//


function generateRandomString(){
    let text = " ";
    let charset = "ABCDEFGHIJKLMNOPQRSTUABCDEFGHIJKLMNOPQRSTUVWXYZVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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
  for(let key in users){
    if(users[key].email === email) {
      // console.log('this,\ user -> ', users[key]);
      return users[key];
    }
  }
}
function urlsForUser(id, allUrls) {
  const myURLs = {};
  for (const shortURL in allUrls) {
    if (allUrls[shortURL].userID === id) {
      myURLs[shortURL] = allUrls[shortURL].longURL;
    }
  }
  return myURLs;
}

//--------********* ROUTING *********-----------//

// app.get('/', (req, res) => {
//   if (req.session.user_id) {
//     res.redirect('/urls');
//     return;
//   }
//   res.redirect('/login');
// });
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDB);
});

// --- home

app.get('/urls', (req, res) =>{
    let templateVars = {
      urls: urlsForUser(req.session.user_id, urlDB),
      user: users[req.session.user_id],
    };
    res.render('urls_index', templateVars);
});

// --- new

app.get('/urls/new', (req, res) =>{
  if (!(req.session.user_id)) {
    res.redirect('/login');
  } else {
    let templateVars = {
      urls: urlDB,
      user: users[req.session.user_id],
    };
    res.render('urls_new', templateVars);
  }
});


//---- register


app.get('/register', (req, res) =>{
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }

  let templateVars = {urls: urlDB};

  res.render('urls_register', templateVars);
});


app.post("/register", (req,res) => {
  let { username, email, password } = req.body;

  // DeMorgan's Theorem
  // !(A && B) === (!A || !B)
  // !(A || B) === (!A && !B)
  console.log('Register', username, email, password);
  if (!password || !email) {
    console.log('Email or password missing')
    return res.status(400).render('urls_register', {
      error: 'Email or password not manifested'
    });
  }

  if (emailTaken(email)) {
    console.log('Email Taken', users);
    return res.status(400).render('urls_register', {
      error: 'Email already here, but not here here, somewhere there'
    });
  } else {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      const randomId = generateRandomString();
      const newUser =  {
        id: randomId,
        username,
        email,
        password: hash
      };
      users[randomId] = newUser;

      req.session.user_id = randomId;
      res.redirect('/urls');
    });
  }

});


//------ Login


app.get('/login', (req, res) =>{
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  } else  {
    res.render('urls_login');
  }
});

app.post('/login', (req, res) =>{

  let {email, password} = req.body;
  let user = findUser(email);

  if (!user) {
      res.status(403).render("urls_login", {
        error: "Incorrect email my G"
      });
  } else {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).render("urls_login", {
        error: "That be an incorrect email, my partner"
      });
    } else {
      req.session.user_id = user.id;
      res.redirect('/urls');
    }
  }

});


//--- logout
app.post('/urls/logout', (req, res) =>{
  req.session = null;
  res.redirect('/urls');
});


app.get('/urls/:id', (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    let shortURL = req.params.id;
    let longURL = urlDB[shortURL].longURL;
    console.log("BWAHH -->", longURL);
    let templateVars = {
      user: user,
      shortURL: shortURL,
      longURL: longURL
    };
    console.log('lookie', templateVars);
    res.render("urls_show", templateVars)
  } else {
      res.status(401).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
  }
});

// --- DELETE URL
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;

  let {id}        = req.params,
      urlObject = urlDB[id];

  if (userID && users[userID]){
    if (userID === urlObject.userID){
      delete urlDB[id];
      res.redirect("/urls");
    } else {
      res.status(401).render("urls_index", {error: `This url has a owner, but it ain't you`}).redirect("/urls");
    }
  } else {
    res.status(401).render("urls_index", {error: `you ain't from around here, is ya?`}).redirect("/urls");
  }
});

// --- UPDATE LONGURL THAT SHORT ID POSTS TO----
app.post('/urls/:id/update', (req, res) => {
  const userID = req.session.user_id;
  let id = req.params.id;
  let urlObject = urlDB[id];
  if (userID && users[userID]) {
    if (userID === urlObject.userID){
      let longURL = req.body.update_longURL;
      urlDB[id].longURL = longURL;
      res.redirect("/urls");
    } else {
      res.status(400).render("urls_index", {error: 'You must be logged in'}).redirect("/urls");
    }
  } else {
      res.status(400).render("urls_index", {error: 'You must be logged in'}).redirect("/urls");
    }
});

//CLick short, redirect to full url
app.get('/u/:id', (req, res) => {
  const { id } = req.params;
  const { longURL } = urlDB[id];

  res.redirect(longURL);

});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.status(404).send('404: Not found');
    return;
  }
  let shortURL = generateRandomString();
  urlDB[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

