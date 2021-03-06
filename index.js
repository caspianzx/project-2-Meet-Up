// Configurations for express, method override, react, pg
const express = require('express');
const app = express();
const pg = require('pg');
const cookieParser = require('cookie-parser');
const alert =  require('alert-node');



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//////heroku set up////
// inside of db.js

//require the url library
//this comes with node, so no need to yarn add
const url = require('url');

//check to see if we have this heroku environment variable
if (process.env.DATABASE_URL ){

  //we need to take apart the url so we can set the appropriate configs

    const params = url.parse(process.env.DATABASE_URL);
    const auth = params.auth.split(':');

  //make the configs object
    var configs = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
    };

    }else{
  //otherwise we are on the local network
    var configs = {
    user: 'caspianzx',
    host: '127.0.0.1',
    database: 'event',
    port: 5432
  };
}


const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

// express configuration
app.use(express.static(__dirname+'/public/'));

const reactEngine = require('express-react-views').createEngine();
app.engine('jsx', reactEngine);
//use for overriding update/delete http request
const methodOverride = require('method-override')
app.use(methodOverride('_method'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');


/////////////////////"model function goes here"/////////////////////////////

///redirect function to ensure that user has sign in to go to appropriate pages
const redirectLogin = (request, response, next) => {
    if (!request.cookies.id) {
        response.redirect('/login');
    } else {
        next();
    }
};
//redirect function to event page
const redirectEventpage = (request, response, next) => {
    if (request.cookies.id) {
        response.redirect('/user/events');
    } else {
        next();
    }
}

////new event form done
app.post('/events/new', redirectLogin, (request, response) => {
    // console.log("post works!");
    // // console.log(request.body);
    // reassign request.body to a var
    eventDetails = request.body;
    console.log(eventDetails);

    //pg sql query
    let queryText = 'INSERT INTO event (name, venue, _date, _time, category, img_url, description, account_id)  VALUES ($1, $2, $3 ,$4, $5, $6, $7, $8)';
    //variable to store the info
    const values = [eventDetails.name, eventDetails.venue, eventDetails._date, eventDetails._time, eventDetails.category, eventDetails.img_url, eventDetails.description, request.cookies.id];
    //redirect back to user dashboard if successful
    pool.query(queryText, values, (err, res) => {
        if (err) {
            console.log("query error", err.message);
        } else {
            console.log("id of the thing you just created:");
            response.redirect('/user');
        }
    });
});

//get request for new form
app.get('/events/new', redirectLogin, (request, response) => {
    let data={ name: request.cookies.name};
    response.render('form.jsx', data);
});

//account signup request
app.post('/signup',  (request, response) => {
    // response.send(`<html>account created!</html>`);
    let queryText = 'SELECT email FROM account WHERE email = $1';
    const values = [request.body.email];
    //nested query 1) check if email exist, if not, carry on. if yes, alert user
    //1st pg query
    pool.query(queryText, values, (err, res) => {
        if (err) {
            console.log("query error", err.message);
        } else {
            // console.log("here's all the email!", res.rowCount);
            //alert user if email exist
            if (res.rowCount ===1) {
                response.send("this email already exist!");
            } else {
                console.log(request.body.email);
                //2nd pg sql query
                let queryText = 'INSERT INTO account (name, email, password)  VALUES ($1, $2, $3)';
                const values = [request.body.name, request.body.email, request.body.password];
                pool.query(queryText, values, (err, res) => {
                    if (err) {
                        console.log("query error", err.message);
                    } else {
                        console.log("successfully created account");
                        //will update and redirect to log in page to overcome the issue of user id
                        response.redirect('/user');
                    }
                });
            }
        }
    });
});

app.get('/signup', (request, response) => {
    response.render('registration.jsx');
});

app.post('/login', (request, response) => {
    console.log("logged in");
    console.log(request.body);
    //check if email and password is correct
    let queryText = 'SELECT password, id, name FROM account WHERE email = $1';
    const values = [request.body.email];
    //pool query
    pool.query(queryText, values, (err, res) => {
        if (err) {
            console.log("query error", err.message);
        } else {
            if (res.rowCount === 0) {
                response.redirect('/signup');
            } if (res.rowCount ===1 && res.rows[0].password != request.body.password){
                response.redirect('/signup');
            } if (res.rowCount ===1 && res.rows[0].password === request.body.password) {
                response.cookie('loggedin', true);
                response.cookie('id', res.rows[0].id );
                response.cookie('name', res.rows[0].name);
                response.redirect ('/user');
            }
        }
    });
});






app.get('/login', redirectEventpage, (request, response) => {
    response.render('login.jsx');
});



app.get('/user', redirectLogin, (request, response) => {

    // response.send(request.cookies.id);
    //to_char converts time to 24h format
    let query = 'SELECT id, name, venue, _date, TO_CHAR(_time, $1) FROM event where account_id = $2';
    //acc id is cookie num
    var cookieNumber = parseInt(request.cookies.id);
    const values = ['hh24:mi', cookieNumber];
    //nested query
    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            response.send( 'query error' );
        } else {
            // console.log (result.rows);

            ////assign 1st query result to eventHost
            let eventHost = result.rows;
            //pg sql query inner join 2 tables
            let queryText = 'SELECT event.id, event.name, event.venue , event._date , TO_CHAR(event._time, $1) FROM event INNER JOIN attending_event ON (event.id = attending_event.event_id) WHERE attending_event.account_id = $2'

            const values = ['hh24:mi', request.cookies.id];
            //2nd query
            pool.query(queryText, values, (err, result) => {
                if (err) {
                    console.error('query error:', err.stack);
                    response.send( 'query error' );
                } else {
                    //assign 2nd query results to eventID
                    let eventID = result.rows;
                    // console.log(eventHost);
                    // console.log (eventID);
                    // response.send("query works");

                    ///encapsulate both query results into data var
                    let data = {name: request.cookies.name,
                        id:request.cookies.id,
                        eventHost: eventHost,
                        eventRegistered : eventID};

                    // console.log (data);
                    response.render('user.jsx', data);
                }
            });
        }
    });
});

//get request to event page AFTER login
app.get('/user/events', redirectLogin, (request, response) => {
    console.log('index is reading');
    const query = 'SELECT id, name, venue, img_url, description, _date, TO_CHAR(_time, $1) FROM event';
    const values = ['hh24:mi'];
    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            response.send( 'query error' );
        } else {
            var data = {eventDetail: result.rows,
                name: request.cookies.name};
            // console.log (data);
            response.render('userEvent.jsx', data);
        }
    });
});


//log out request
app.get('/logout', (request, response) => {
    response.clearCookie("loggedin");
    response.clearCookie("name");
    response.clearCookie("id");
    response.redirect('/');
});

//post request to
app.post('/user/events/:id', redirectLogin, (request,response) => {
    // response.send("event description page")
    console.log(request.params.id);
    console.log (request.cookies.id);

    let queryText = 'SELECT * FROM attending_event WHERE account_id = $1 AND event_id = $2';
    //request.params.id comes from /id
    const values = [request.cookies.id, request.params.id];
    //nested query to check if user has signed up, if yes, alert. if not, sign up
    pool.query(queryText, values, (err, res) => {
        if (err) {
            console.log("query error", err.message);
        } else {
            console.log("here's all the record!", res.rowCount);
            if (res.rowCount ===1) {
                alert('You have already signed up for this event!');
                //need to figure a way to update user that they have already signed up
                response.redirect("/user/events/" + request.params.id);
            } else {
                console.log(request.cookies.id);
                let queryText = 'INSERT INTO attending_event (account_id, event_id)  VALUES ($1, $2)';
                const values = [request.cookies.id, request.params.id];
                pool.query(queryText, values, (err, res) => {
                    if (err) {
                        console.log("query error", err.message);
                    } else {
                        console.log("successfully signed up for event");

                        //alert user that they have successful signed up for the event
                        response.redirect('/user/events/success');
                    }
                });
            }
        }
    });
});

//get request for successful sign up
app.get('/user/events/success', redirectLogin, (request,response) => {
    data={
        name: request.cookies.name
    }
    response.render('Success' , data);
 })



app.get('/user/events/:id', redirectLogin, (request,response) => {
    // response.send("event description page")
    console.log(request.params.id);

    const query = 'SELECT id, name, venue, img_url, description, _date, TO_CHAR(_time, $1) FROM event WHERE event.id = $2';
    const values = ['hh24:mi', request.params.id];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            response.send( 'query error' );
        } else {

            let data = {name: request.cookies.name,
                id:request.cookies.id,
                eventDetails: result.rows[0]};
            console.log (data);
            response.render('event.jsx', data)
        }
    });
});


app.get('/events/:id', (request,response) => {
    // response.send("event description page")
    console.log(request.params.id);

    const query = 'SELECT id, name, venue, img_url, description, _date, TO_CHAR(_time, $1) FROM event WHERE event.id = $2';
    const values = ['hh24:mi', request.params.id];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            response.send( 'query error' );
        } else {

            let data = {name: request.cookies.name,
                id:request.cookies.id,
                eventDetails: result.rows[0]};
            console.log (data);
            response.render('eventNotLoggedIn.jsx', data)
        }
    });
});



////display indexpage with info from database

app.get('/events', redirectEventpage, (request,response) => {
    console.log('index is reading');

    const query = 'SELECT id, name, venue, img_url, description, _date, TO_CHAR(_time, $1) FROM event';
    const values = ['hh24:mi'];
    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            response.send( 'query error' );
        } else {
            var data = {eventDetail: result.rows};
            // console.log (data);
            response.render('indexPage.jsx', data)
        }
    });
});

// redirect to indexpage
app.get('/', redirectEventpage, (request,response) => {
    response.redirect('/events');
});


// listening for 300 port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log('~~~ Tuning in to the waves of port '+PORT+' ~~~'));