const router = require('express').Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const connection = require('../config/db_connection');
const { registerSchema, CustomerRegInfo, loginSchema, flightSchema } = require('../validation/authValidation');
const { ensureLoggedin, ensureAdminAuthenticated } = require('../middlewares/ensureLoggedin');
const { json } = require('express');
const current_day = (date = new Date()) => `${date.getFullYear()}-${(date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : `0${(date.getMonth() + 1)}`}-${(date.getDate()) > 9 ? date.getDate() : `0${date.getDate()}`}`;
let error_arr = [];
const util = require('util');


const styles = {
    includeIndexCSS: false,
    includeFlightBookCSS: false,
    includeContactCSS: false,
    includeSignInCSS: false,
    includeSignUpCSS: false,
    includeAdminCSS: false,
    includeDashboardCSS: false,
}

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {//don't be tempted to use exceptions bro 😂 no-need    
    if (req.path == '/admin/signin') {
        connection.query('SELECT * FROM admin WHERE email = ?', [email], (err, user) => {
            if (err) {
                return done(err);
            } else if (!user.length) {
                return done(null, false, req.flash('error', 'Oops! invalid admin'));
            } else if (!bcryptjs.compareSync(password, user[0].password)) {
                return done(null, false, req.flash('error', 'Oops! Incorrect password.'));
            } else {
                return done(null, { user, type: 'admin' }, req.flash('success', `Welcome ${user[0].email}`));
            }
        });
    } else {
        connection.query('SELECT * FROM user WHERE email = ?', [email], (err, user) => {
            if (err) {
                return done(err);
            } else if (!user.length) {
                return done(null, false, req.flash('error', 'Oops! invalid user'));
            } else if (!bcryptjs.compareSync(password, user[0].password)) {
                return done(null, false, req.flash('error', 'Oops! Incorrect password.'));
            } else {
                return done(null, { user, type: 'user' }, req.flash('success', `Welcome ${user[0].email}`));
            }
        });
    }
})
);

passport.serializeUser(({ user, type }, done) => {
    if (type == 'admin') {
        done(null, { id: user[0].id, type, isAdmin: user[0].isAdmin });
    }
    else {
        done(null, { id: user[0].id, type });
    }
});

passport.deserializeUser(({ id, type }, done) => {
    try {
        if (type === 'admin') {
            connection.query('SELECT * FROM admin WHERE id = ?', [id], (err, user) => {
                if (err) done(err, null);
                else done(null, user[0]);
            });
        } else if (type === 'user') {
            connection.query('SELECT * FROM user WHERE id = ?', [id], (err, user) => {
                if (err) done(err, null);
                else done(null, user[0]);
            });
        } else {
            done(null, null);
        }
    } catch (error) {
        done(error, null);
    }
});

router.get('/', (req, res) => {
    styles.includeFlightBookCSS = false;
    styles.includeContactCSS = false;
    styles.includeIndexCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeSignInCSS = false
    styles.includeAdminCSS = false
    styles.includeDashboardCSS = false;

    try {
        const sql = `SELECT * FROM flights WHERE available_seats > 0 ORDER BY id DESC`;
        connection.query(sql, (err, result) => {
            if (err) {
                throw err;
            } else {
                res.render('index', {
                    errors: req.flash("error"),
                    success: req.flash("success"),
                    title: `Flight | Search`,
                    description: 'Search for available fight',
                    includeCSS: styles,
                    availableFlights: result,
                });
            }
        });
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/api/admin/dashboard');
    }
});

router.get('/book-flight', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = true;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('book-flight', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Book`,
        description: 'Book for available fight',
        includeCSS: styles
    });
});

router.get('/contact', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = true;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('contact', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | contact`,
        description: 'contact for available fight',
        includeCSS: styles
    });
});

router.get('/signin', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('signin', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | signin`,
        description: 'signin for available fight',
        includeCSS: styles,
        isAdmin: false
    });
});

router.get('/signup', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = true;
    styles.includeAdminCSS = true;
    styles.includeDashboardCSS = false;
    res.render('signup', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | signup`,
        description: 'contact for available fight',
        includeCSS: styles,
        isAdmin: false
    });
});

router.get('/admin', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = true;
    styles.includeDashboardCSS = false;
    res.render('admin', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | admin`,
        description: 'admin for available fight',
        includeCSS: styles
    });
});

router.post('/signin', passport.authenticate("local", {
    successRedirect: '/api/dashboard',
    failureRedirect: '/api/signin',
    successFlash: true,
    failureFlash: true
}));

router.post('/signup', (req, res) => {
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        req.flash('error', error_arr);
        res.redirect('/api/signup');
        error_arr = [];
    } else {
        try {
            const emailExist = `SELECT email FROM user WHERE ? = email`;
            connection.query(emailExist, [req.body.email], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/api/signup');
                } else if (result.length !== 0) {
                    req.flash('error', 'Email exists already!');
                    res.redirect('/api/signin');
                } else {
                    const userid = uuidv4();
                    let salt = bcryptjs.genSaltSync(10);
                    let { email, password, firstName, lastName, dob,
                        gender, contactNo, passportNo, addressLine1, city } = req.body;
                    password = bcryptjs.hashSync(req.body.password, salt);
                    const sql = `INSERT INTO user (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, [email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city], (err, result) => {
                        if (err) {
                            throw err
                        } else {
                            req.flash('success', 'User successfully registered!');
                            res.redirect('/api/signin');
                        }
                    });
                }
            });
        } catch (error) {
            req.flash('error', `${error}`);
            res.redirect('/api/signup');
        }
    }
});

router.post('/signout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        return res.redirect("/api/signin");
    });
});

router.get('/dashboard', ensureLoggedin, (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = true;
    styles.includeDashboardCSS = false;

    try {
        const sql = `SELECT * FROM flights WHERE available_seats > 0 ORDER BY id DESC`;
        connection.query(sql, (err, result) => {
            if (err) {
                throw err;
            } else {
                res.render('dashboard', {
                    errors: req.flash("error"),
                    success: req.flash("success"),
                    title: `Flight | dashboard`,
                    description: 'dashboard for available members',
                    includeCSS: styles,
                    isAdmin: false,
                    availableFlights: result,
                    user: {
                        userid: req.user.id,
                        useremail: req.user.email,
                        userfirst_name: req.user.first_name,
                        userlast_name: req.user.last_name,
                    },
                });
            }
        });
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/api/admin/dashboard');
    }
});

// router.get('/dashboard/get-booked-flights/:id', ensureLoggedin, (req, res) => {
//     const userid = req.params.id;
//     if (!userid) {
//         return res.status(400).json({ message: 'Invalid User ID!' });
//     }

//     try {
//         let arr = [];
//         const get_booked_flights = `SELECT * FROM booking WHERE user_id = ? ORDER BY booking_id DESC`;
//         connection.query(get_booked_flights, [userid], (err, result) => {
//             if (err) {
//                 return res.status(400).json({ message: `${err}` });
//             } else {
//                 result.forEach(res => {
//                     const sql = `SELECT * FROM flights WHERE id = ?`;
//                     connection.query(sql, [res.flight_id], (err, flightinfo_result) => {
//                         if (err) {
//                             return res.status(400).json({ message: `${err}` });
//                         } else {
//                             res.flightinfo = flightinfo_result;
//                             // res.json({ message: 'User booked flight(s)', booked_flights: flightinfo_result });
//                         }
//                     });
//                 })
//                 console.log("booking: ", result);
//                 res.json({ message: 'Available booked flights', booked_flights: result });
//             }
//         });
//     } catch (error) {
//         return res.status(400).json({ message: `${error}` });
//     }
// });

// Convert connection.query to return a Promise
const query = util.promisify(connection.query).bind(connection);

router.get('/dashboard/get-booked-flights/:id', ensureLoggedin, async (req, res) => {
    const userid = req.params.id;
    if (!userid) {
        return res.status(400).json({ message: 'Invalid User ID!' });
    }

    try {
        const get_booked_flights = `SELECT * FROM booking WHERE user_id = ? ORDER BY booking_id DESC`;
        const bookedFlights = await query(get_booked_flights, [userid]);

        const bookedFlightsWithInfo = await Promise.all(
            bookedFlights.map(async (booking) => {
                console.log(booking.flight_id)
                const flightInfoQuery = `SELECT * FROM flights WHERE id = ?`;
                const flightInfo = await query(flightInfoQuery, [booking.flight_id]);
                booking.flightinfo = flightInfo[0];
                return booking;
            })
        );
        console.log(bookedFlightsWithInfo.flightInfo)
        res.json({ message: 'Available booked flights', booked_flights: bookedFlightsWithInfo });
    } catch (error) {
        res.status(400).json({ message: `${error}` });
    }
});


router.get('/dashboard/check-available-flights/:id/:passenger_count', ensureLoggedin, (req, res) => {
    const flightId = req.params.id;
    const passenger_count = req.params.passenger_count;
    if (!flightId) {
        return res.status(400).json({ message: 'Invalide Flight ID pls, check your network!' });
    }
    try {
        // select seats to confirm no's
        const get_available_seats = `SELECT available_seats FROM flights WHERE id = ?`;
        connection.query(get_available_seats, [flightId], (err, result) => {
            if (err) {
                return res.status(400).json({ message: `${err}`, seats: 'null' });
            } else if (result.length === 0) {
                res.status(400).json({ message: 'Available seats not found', seats: 'null' });
            } else {
                const available_seats = result[0]["available_seats"];
                if (available_seats === 0 || (available_seats - passenger_count) < 0) {
                    return res.status(422).json({
                        message: `${!(available_seats === 0) ?
                            available_seats : 'No'} Available seats for booking, ${(available_seats - passenger_count) < 0 ?
                                'Try booking for less persons please.' : ''}`, seats: 'null'
                    });
                } else {
                    res.json({ message: 'Available seats for booking.', seats: available_seats });
                }
            }
        });
    } catch (error) {
        return res.status(400).json({ message: `${error}` });
    }
});

router.post('/dashboard/book-flight', ensureLoggedin, (req, res) => {
    const {
        flightId,
        userid,
        useremail,
        userfirstname,
        userlastname,
        basePrice,
        computedAmount,
        passenger_count,
        flight_class,
        flight_note,
        paymentReference,
        paymentMessage,
        availableSeats
    } = req.body;

    if (!flightId) {
        return res.status(400).json({ message: 'Invalid Flight ID, please check your network!' });
    }

    try {
        // select seats to confirm no's
        const get_available_seats = `SELECT available_seats, last_assigned_seats FROM flights WHERE id = ?`;
        connection.query(get_available_seats, [flightId], (err, result) => {
            if (err) {
                return res.status(400).json({ message: `Error: ${err}`, seats: 'null' });
            } else if (result.length === 0) {
                res.status(400).json({ message: 'Available seats not found', seats: 'null' });
            } else {
                const available_seats = parseInt(result[0]["available_seats"]);
                const last_seats_db = parseInt(result[0]["last_assigned_seats"]);
                if (available_seats === 0 || available_seats !== availableSeats || (available_seats - passenger_count) < 0) {
                    return res.status(422).json({
                        message: `${!(available_seats === 0) ? available_seats : 'No'} available seats for booking, ${(available_seats - passenger_count) < 0 ? 'Try booking for fewer persons please.' : ''}`, seats: 'null'
                    });
                } else {
                    const seatsArr = [];
                    const new_available_seats = available_seats - passenger_count;
                    for (let i = 1; i <= passenger_count; i++) {
                        seatsArr.push(last_seats_db + i);
                    }
                    const update_seats = `UPDATE flights SET available_seats = ?, last_assigned_seats = ? WHERE id = ?`;
                    connection.query(update_seats, [new_available_seats, seatsArr[seatsArr.length - 1], flightId], (err, result) => {
                        if (err) {
                            return res.status(400).json({ message: `Error: ${err}` });
                        } else {
                            if (result.affectedRows === 0) {
                                return res.status(500).json({ message: `Invalid seats update ${err}` });
                            } else {
                                const book_the_booking = `INSERT INTO booking (
                                    flight_id, 
                                    user_id,
                                    passenger_count, 
                                    seat_numbers, 
                                    booking_status, 
                                    paid_price, 
                                    pending_payment, 
                                    booking_reference, 
                                    booking_notes, 
                                    booked_class
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                connection.query(book_the_booking, [
                                    flightId,
                                    userid,
                                    passenger_count,
                                    JSON.stringify(seatsArr), // Convert seatsArr to JSON string
                                    "Booked",//ideally, to verify transaction with axios b4 <= booked or not-booked
                                    computedAmount * 100,
                                    false,//ideally, to verify transaction with axios if 1 <= 0 else 1
                                    paymentReference,
                                    JSON.stringify([flight_note, paymentMessage]), // Convert array to JSON string
                                    flight_class
                                ], (err, result) => {
                                    if (err) {
                                        return res.status(500).json({ message: `Error: ${err}` });
                                    } else {
                                        return res.json({ message: `Flight successfully booked.` });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    } catch (error) {
        return res.status(400).json({ message: `Error: ${error}` });
    }
});

router.get('/admin/signin', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('signin', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin signin`,
        description: 'Admin signin',
        includeCSS: styles,
        isAdmin: true
    });
});

router.get('/admin/signup', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = true;
    styles.includeAdminCSS = true;
    styles.includeDashboardCSS = false;
    res.render('signup', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin signup`,
        description: 'contact for available fight',
        includeCSS: styles,
        isAdmin: true
    });
});

router.post('/admin/signup', (req, res) => {
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        req.flash('error', error_arr);
        res.redirect('/api/admin/signup');
        error_arr = [];
    } else {
        try {
            const emailExist = `SELECT email FROM admin WHERE email = ?`;
            connection.query(emailExist, [req.body.email], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/api/admin/signup');
                } else if (result.length !== 0) {
                    req.flash('error', 'Email exists already!');
                    res.redirect('/api/admin/signin');
                } else {
                    // Create admin user
                    let { email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city } = req.body;
                    const isAdmin = true;
                    const adminId = uuidv4(); // Generating adminId
                    let salt = bcryptjs.genSaltSync(10);
                    password = bcryptjs.hashSync(req.body.password, salt);
                    const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin, adminId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, [email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin, adminId], (err, result) => {
                        if (err) {
                            throw err
                        } else {
                            req.flash('success', 'Admin user successfully registered!');
                            res.redirect('/api/admin/signin');
                        }
                    });
                }
            });
        } catch (error) {
            req.flash('error', `${error}`);
            res.redirect('/api/admin/signup');
        }
    }
});

router.post('/admin/signin', passport.authenticate("local", {
    successRedirect: '/api/admin/dashboard',
    failureRedirect: '/api/admin/signin',
    successFlash: true,
    failureFlash: true
}));

router.post('/admin/signout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        return res.redirect("/api/admin/signin");
    });
});

router.get('/admin/dashboard', ensureAdminAuthenticated, (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = true;
    styles.includeDashboardCSS = false;

    try {
        // const sql = `SELECT * FROM flights`;
        const sql = `SELECT * FROM flights ORDER BY id DESC`;
        connection.query(sql, (err, result) => {
            if (err) {
                throw err;
            } else {
                res.render('dashboard', {
                    errors: req.flash("error"),
                    success: req.flash("success"),
                    title: `Flight | Admin dashboard`,
                    description: 'Admin dashboard',
                    includeCSS: styles,
                    isAdmin: true,
                    availableFlights: result,
                    user: {
                        userid: req.user.id,
                        useremail: req.user.email,
                        userfirst_name: req.user.first_name,
                        userlast_name: req.user.last_name,
                    },
                });
            }
        });
    } catch (error) {
        req.flash('error', `${error}`);
        res.redirect('/api/admin/dashboard');
    }
});

router.get('/admin/dashboard/get-all-booked-flights', ensureAdminAuthenticated, (req, res) => {
    let arr = [];
    try {
        // get all booked flights then get all users for the booked flcights
        const get_all_booked_flights = `SELECT * FROM booking ORDER BY booking_id DESC`;
        connection.query(get_all_booked_flights, (err, result) => {
            if (err) {
                return res.status(400).json({ message: `${err}` });
            } else {
                // console.log(result);
                res.json({ message: 'All Available booked flights', booked_flights: result });
            }
        });
    } catch (error) {
        return res.status(400).json({ message: `${error}` });
    }
});

router.get('/admin/dashboard/get-all-unbooked-flights', ensureAdminAuthenticated, (req, res) => {
    try {
        // get all booked flights then get all users for the booked flcights
        const get_all_booked_flights = `SELECT * FROM booking ORDER BY booking_id DESC`;
        connection.query(get_all_booked_flights, (err, result) => {
            if (err) {
                return res.status(400).json({ message: `${err}` });
            } else {
                // console.log(result);
                res.json({ message: 'All Available booked flights', booked_flights: result });
            }
        });
    } catch (error) {
        return res.status(400).json({ message: `${error}` });
    }
});

router.post('/admin/add-flights', ensureAdminAuthenticated, (req, res) => {
    let takeoff_time = req.body.takeoff_time !== "" ? new Date(req.body.takeoff_time) : "";
    let takeoff_timeDatetime = takeoff_time !== "" ? takeoff_time.toISOString().slice(0, 19).replace('T', ' ') : "";

    let landing_time = req.body.landing_time !== "" ? new Date(req.body.landing_time) : "";
    let landing_timeDatetime = landing_time !== "" ? landing_time.toISOString().slice(0, 19).replace('T', ' ') : "";

    req.body.takeoff_time = takeoff_timeDatetime;
    req.body.landing_time = landing_timeDatetime;

    const { error } = flightSchema.validate(req.body, { abortEarly: false });

    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        req.flash('error', error_arr);
        res.redirect('/api/admin/dashboard');
        error_arr = [];
    } else {
        try {
            const sql = `SELECT * FROM flights WHERE flight_name = ? AND depart_from = ? AND arrive_at = ? AND price = ? AND no_seats = ?`;
            const { flight_name, depart_from, arrive_at, takeoff_time, landing_time, price, no_seats } = req.body;
            connection.query(sql, [flight_name, depart_from, arrive_at, price, no_seats], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/api/admin/dashboard');
                } else if (result.length !== 0) {
                    req.flash('error', 'Flight exists already!');
                    res.redirect('/api/admin/dashboard');
                } else {
                    // Create flight
                    const { flight_name, depart_from, arrive_at, takeoff_time, landing_time, price, no_seats } = req.body;
                    const available_seats = no_seats;
                    const sql = `INSERT INTO flights (flight_name, depart_from, arrive_at, takeoff_time, landing_time, price, no_seats, available_seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, [flight_name, depart_from, arrive_at, takeoff_time, landing_time, price, no_seats, available_seats], (err, result) => {
                        if (err) {
                            throw err
                        } else {
                            req.flash('success', 'Flight successfully added!');
                            res.redirect('/api/admin/dashboard');
                        }
                    });
                }
            });
        } catch (error) {
            req.flash('error', `${error}`);
            res.redirect('/api/admin/dashboard');
        }
    }
});

router.delete('/admin/delete-flight/:id', ensureAdminAuthenticated, (req, res) => {
    const flightId = req.params.id;
    if (!flightId) {
        return res.status(400).json({ message: 'Flight ID is required for deletion' });
    }

    try {
        const sql = `DELETE FROM flights WHERE id = ?`;
        connection.query(sql, [flightId], (err, result) => {
            if (err) {
                return res.status(400).json({ message: 'Failed to delete flight' });
            } else {
                if (result.affectedRows === 0) {
                    res.status(400).json({ message: 'Flight not found' });
                } else {
                    res.json({ message: 'Flight successfully deleted' });
                }
            }
        });
    } catch (error) {
        return res.status(400).json({ message: `${error}` });
    }
});

module.exports = router;