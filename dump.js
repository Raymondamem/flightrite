hi pls I want you to act like "Lakshan-Banneheke" in this repo on github https://github.com/Lakshan-Banneheke/Airline-Reservation-System/issues and help with a flight reservation webapp. i need help on how to go about the database but dont know how to. say the structure of the database and their relationships. note you used postgresql and i am currently using mysqli. if i dont deliver I might not be able to save lifes by registering them for travel to outside cuntry for medical checkups thanks.

const router = require('express').Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const connection = require('../config/db_connection');
const { registerSchema, CustomerRegInfo, loginSchema } = require('../validation/authValidation');
const { ensureLoggedin, ensureAdminAuthenticated } = require('../middlewares/ensureLoggedin');
const current_day = (date = new Date()) => `${date.getFullYear()}-${(date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : `0${(date.getMonth() + 1)}`}-${(date.getDate()) > 9 ? date.getDate() : `0${date.getDate()}`}`;
let error_arr = [];

const styles = {
    includeIndexCSS: false,
    includeFlightBookCSS: false,
    includeContactCSS: false,
    includeSignInCSS: false,
    includeSignUpCSS: false,
    includeAdminCSS: false,
    includeDashboardCSS: false,
}

router.get('/', (req, res) => {
    styles.includeFlightBookCSS = false;
    styles.includeContactCSS = false;
    styles.includeIndexCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeSignInCSS = false
    styles.includeAdminCSS = false
    styles.includeDashboardCSS = false;
    res.render('index', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Search`,
        description: 'Search for available fight',
        includeCSS: styles
    });
});//'localhost:4000/' not 'localhost:4000/user' 😂

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
});//'localhost:4000/' not 'localhost:4000/user' 😂

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
});//'localhost:4000/' not 'localhost:4000/user' 😂

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
        title: `Flight | login`,
        description: 'login for available fight',
        includeCSS: styles
    });
});//'localhost:4000/' not 'localhost:4000/user' 😂

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
        includeCSS: styles
    });
});//'localhost:4000/' not 'localhost:4000/user' 😂

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
});//'localhost:4000/' not 'localhost:4000/user' 😂

router.get('/dashboard', ensureLoggedin, (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = true;
    res.render('dashboard', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | dashboard`,
        description: 'dashboard for available members',
        includeCSS: styles
    });
});//'localhost:4000/' not 'localhost:4000/user' 😂

router.post('/signup', (req, res) => {
    console.log(req.body);
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        console.log(error_arr);
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
                    console.log("email exist:......", result)
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

// passport.serializeUser((user, done) => {
//     done(null, user[0].id);
// });

// passport.deserializeUser((id, done) => {//don't be tempted to use exceptions bro 😂 no-need just "done(err, user[0]);"
//     try {
//         connection.query('SELECT * FROM user WHERE id = ?', [id], (err, user) => {
//             if (err) throw err;
//             done(null, user[0], null);
//         });
//     } catch (error) {
//         done(null, false, error);
//     }
// });

// passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {//don't be tempted to use exceptions bro 😂 no-need
//     connection.query('SELECT * FROM user WHERE email = ?', [email], (err, user) => {
//         if (err) {
//             return done(err);
//         } else if (!user.length) {
//             return done(null, false, req.flash('error', 'Oops! invalid user'));
//         } else if (!bcryptjs.compareSync(password, user[0].password)) {
//             return done(null, false, req.flash('error', 'Oops! Incorrect password.'));
//         } else {
//             return done(null, user, req.flash('success', `Welcome ${user[0].email}`));
//         }
//     });
// })
// );

router.post('/signin', passport.authenticate("local", {
    successRedirect: '/api/dashboard',
    failureRedirect: '/api/signin',
    successFlash: true,
    failureFlash: true
}));

router.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        return res.redirect("/api/signin");
    });
});
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
router.get('/admin/signin', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('admin-signin', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin Login`,
        description: 'Admin login',
        includeCSS: styles
    });
});

router.get('/admin/dashboard', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('admin-dashboard', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin dashboard`,
        description: 'Admin dashboard',
        includeCSS: styles
    });
});

router.post('/admin/signup', (req, res) => {
    console.log(req.body);
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        console.log(error_arr);
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
                    console.log("email exist:......", result)
                    req.flash('error', 'Email exists already!');
                    res.redirect('/api/admin/signin');
                } else {
                    // Create admin user
                    // const { email, password, firstName, lastName, dob,
                    //     gender, contactNo, passportNo, addressLine1, city } = req.body;
                    // const isAdmin = true; // Set isAdmin to true for admin user
                    // // Hash password
                    // let salt = bcryptjs.genSaltSync(10);
                    // let hashedPassword = bcryptjs.hashSync(password, salt);
                    // const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    // connection.query(sql, [email, hashedPassword, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin], (err, result) => {
                    const { email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city } = req.body;
                    const isAdmin = true;
                    const adminId = uuidv4(); // Generating adminId
                    const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin, adminId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, [email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin, adminId], (err, result) => {

                        if (err) {
                            // Handle database error
                            throw err
                        } else {
                            // Admin user created successfully
                            req.flash('success', 'Admin user successfully registered!');
                            res.redirect('/api/admin/signin');
                        }
                    });
                }
            });
        } catch (error) {
            // Handle other errors
            req.flash('error', `${error}`);
            res.redirect('/api/admin/signup');
        }
    }
});

// Serialize and Deserialize Admin User
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//     connection.query('SELECT * FROM admin WHERE id = ?', [id], (err, admin) => {
//         if (err) {
//             return done(err);
//         }
//         done(null, admin[0]);
//     });
// });

// // Admin Local Strategy
// passport.use('admin-local', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     connection.query('SELECT * FROM admin WHERE email = ?', [email], (err, admin) => {
//         if (err) {
//             return done(err);
//         } else if (!admin.length) {
//             return done(null, false, req.flash('error', 'Admin not found'));
//         } else if (!bcryptjs.compareSync(password, admin[0].password)) {
//             return done(null, false, req.flash('error', 'Incorrect password'));
//         } else {
//             return done(null, admin[0], req.flash('success', `Welcome ${admin[0].email}`));
//         }
//     });
// }));

// router.post('/admin/signin', passport.authenticate("admin-local", {
//     successRedirect: '/admin/dashboard',
//     failureRedirect: '/admin/signin',
//     failureFlash: true
// }));

// /////////////////////////////recommended//////////////////////////////////
passport.serializeUser((user, done) => {
    if (user.isAdmin) {
        // If user is an admin, use adminId
        done(null, user.adminId);
    } else {
        // For regular users, use id
        done(null, user.id);
    }
});
// Creating an admin user

passport.deserializeUser((id, done) => {
    if (isAdminUser(id)) {
        // If it's an admin user
        connection.query('SELECT * FROM admin WHERE adminId = ?', [id], (err, admin) => {
            if (err) {
                return done(err);
            }
            if (!admin || admin.length === 0) {
                return done(null, false);
            }
            return done(null, admin[0]);
        });
    } else {
        // For regular users
        connection.query('SELECT * FROM user WHERE id = ?', [id], (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user || user.length === 0) {
                return done(null, false);
            }
            return done(null, user[0]);
        });
    }
});
function isAdminUser(id) {
    // Check if id matches adminId
    // This is a simplistic example, you may have a different way to identify admin users
    // For example, you may have a separate table for admin users
    return id.startsWith('admin_');
}

module.exports = router;





////////////////////////////////////////////////////////////////////////////////////////////////////////////





const router = require('express').Router();
const passport = require("passport");
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const connection = require('../config/db_connection');
const { CustomerRegInfo } = require('../validation/authValidation');
const { ensureLoggedin } = require('../middlewares/ensureLoggedin');

const styles = {
    includeIndexCSS: false,
    includeFlightBookCSS: false,
    includeContactCSS: false,
    includeSignInCSS: false,
    includeSignUpCSS: false,
    includeAdminCSS: false,
    includeDashboardCSS: false,
}

router.get('/', (req, res) => {
    // Render index page
});

// Other routes...

router.post('/signup', (req, res) => {
    // Handle user signup
});

router.post('/signin', passport.authenticate("local", {
    successRedirect: '/dashboard',
    failureRedirect: '/signin',
    successFlash: true,
    failureFlash: true
}));

router.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        return res.redirect("/signin");
    });
});

router.get('/dashboard', ensureLoggedin, (req, res) => {
    // Render dashboard
});

// Admin routes
router.get('/admin/signin', (req, res) => {
    // Render admin signin page
});

router.get('/admin/dashboard', (req, res) => {
    // Render admin dashboard
});

router.post('/admin/signup', (req, res) => {
    const { email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city } = req.body;
    const isAdmin = true;
    const adminId = uuidv4();
    const hashedPassword = bcryptjs.hashSync(password, 10); // Hash the password

    const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin, adminId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [email, hashedPassword, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin, adminId], (err, result) => {
        if (err) {
            // Handle database error
            req.flash('error', 'Error creating admin user');
            res.redirect('/admin/signup');
        } else {
            // Admin user created successfully
            req.flash('success', 'Admin user successfully registered!');
            res.redirect('/admin/signin');
        }
    });
});

// Serialize and deserialize user functions
passport.serializeUser((user, done) => {
    if (user.isAdmin) {
        done(null, user.adminId);
    } else {
        done(null, user.id);
    }
});

passport.deserializeUser((id, done) => {
    if (isAdminUser(id)) {
        connection.query('SELECT * FROM admin WHERE adminId = ?', [id], (err, admin) => {
            if (err) {
                return done(err);
            }
            if (!admin || admin.length === 0) {
                return done(null, false);
            }
            return done(null, admin[0]);
        });
    } else {
        connection.query('SELECT * FROM user WHERE id = ?', [id], (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user || user.length === 0) {
                return done(null, false);
            }
            return done(null, user[0]);
        });
    }
});

function isAdminUser(id) {
    return id.startsWith('admin_');
}

module.exports = router;



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////









const router = require('express').Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const connection = require('../config/db_connection');
const { registerSchema, CustomerRegInfo, loginSchema } = require('../validation/authValidation');
const { ensureLoggedin, ensureAdminAuthenticated } = require('../middlewares/ensureLoggedin');
const current_day = (date = new Date()) => `${date.getFullYear()}-${(date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : `0${(date.getMonth() + 1)}`}-${(date.getDate()) > 9 ? date.getDate() : `0${date.getDate()}`}`;
let error_arr = [];

const styles = {
    includeIndexCSS: false,
    includeFlightBookCSS: false,
    includeContactCSS: false,
    includeSignInCSS: false,
    includeSignUpCSS: false,
    includeAdminCSS: false,
    includeDashboardCSS: false,
}

router.get('/', (req, res) => {
    styles.includeFlightBookCSS = false;
    styles.includeContactCSS = false;
    styles.includeIndexCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeSignInCSS = false
    styles.includeAdminCSS = false
    styles.includeDashboardCSS = false;
    res.render('index', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Search`,
        description: 'Search for available fight',
        includeCSS: styles
    });
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
        title: `Flight | login`,
        description: 'login for available fight',
        includeCSS: styles
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
        includeCSS: styles
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

router.get('/dashboard', ensureLoggedin, (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = false;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = true;
    res.render('dashboard', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | dashboard`,
        description: 'dashboard for available members',
        includeCSS: styles
    });
});

router.post('/signup', (req, res) => {
    console.log(req.body);
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        console.log(error_arr);
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
                    console.log("email exist:......", result)
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

router.post('/signin', passport.authenticate("local", {
    successRedirect: '/api/dashboard',
    failureRedirect: '/api/signin',
    successFlash: true,
    failureFlash: true
}));

router.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        return res.redirect("/api/signin");
    });
});
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
// ///////////////////////admin strategy///////////////////////////////////////////////////////////////////
router.get('/admin/signin', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('admin-signin', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin Login`,
        description: 'Admin login',
        includeCSS: styles
    });
});

router.get('/admin/dashboard', (req, res) => {
    styles.includeIndexCSS = false;
    styles.includeContactCSS = false;
    styles.includeFlightBookCSS = false;
    styles.includeSignInCSS = true;
    styles.includeSignUpCSS = false;
    styles.includeAdminCSS = false;
    styles.includeDashboardCSS = false;
    res.render('admin-dashboard', {
        errors: req.flash("error"),
        success: req.flash("success"),
        title: `Flight | Admin dashboard`,
        description: 'Admin dashboard',
        includeCSS: styles
    });
});

router.post('/admin/signup', (req, res) => {
    console.log(req.body);
    const { error } = CustomerRegInfo.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(item => {
            error_arr.push(item.message);
        });
        console.log(error_arr);
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
                    console.log("email exist:......", result)
                    req.flash('error', 'Email exists already!');
                    res.redirect('/api/admin/signin');
                } else {
                    // Create admin user
                    // const { email, password, firstName, lastName, dob,
                    //     gender, contactNo, passportNo, addressLine1, city } = req.body;
                    // const isAdmin = true; // Set isAdmin to true for admin user
                    // // Hash password
                    // let salt = bcryptjs.genSaltSync(10);
                    // let hashedPassword = bcryptjs.hashSync(password, salt);
                    // const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    // connection.query(sql, [email, hashedPassword, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin], (err, result) => {
                    const { email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city } = req.body;
                    const isAdmin = true;
                    const adminId = uuidv4(); // Generating adminId
                    const sql = `INSERT INTO admin (email, password, first_name, last_name, dob, gender, contact_no, passport_no, address_line1, city, isAdmin, adminId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sql, [email, password, firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, city, isAdmin, adminId], (err, result) => {

                        if (err) {
                            // Handle database error
                            throw err
                        } else {
                            // Admin user created successfully
                            req.flash('success', 'Admin user successfully registered!');
                            res.redirect('/api/admin/signin');
                        }
                    });
                }
            });
        } catch (error) {
            // Handle other errors
            req.flash('error', `${error}`);
            res.redirect('/api/admin/signup');
        }
    }
});

// /////////////////////////////recommended//////////////////////////////////
passport.serializeUser((user, done) => {
    if (user.isAdmin) {
        // If user is an admin, use adminId
        done(null, user.adminId);
    } else {
        // For regular users, use id
        done(null, user.id);
    }
});
// Creating an admin user

passport.deserializeUser((id, done) => {
    if (isAdminUser(id)) {
        // If it's an admin user
        connection.query('SELECT * FROM admin WHERE adminId = ?', [id], (err, admin) => {
            if (err) {
                return done(err);
            }
            if (!admin || admin.length === 0) {
                return done(null, false);
            }
            return done(null, admin[0]);
        });
    } else {
        // For regular users
        connection.query('SELECT * FROM user WHERE id = ?', [id], (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user || user.length === 0) {
                return done(null, false);
            }
            return done(null, user[0]);
        });
    }
});

router.post('/admin/signin', passport.authenticate("local", {
    successRedirect: '/api/admin/dashboard',
    failureRedirect: '/api/admin/signin',
    successFlash: true,
    failureFlash: true
}));

function isAdminUser(id) {
    // Check if id matches adminId
    // This is a simplistic example, you may have a different way to identify admin users
    // For example, you may have a separate table for admin users
    return id.startsWith('admin_');
}

module.exports = router;


<div>
    <select>
        <option value="" disabled>Class</option>
        <option value="Business">Business</option>
        <option value="Economy">Economy</option>
    </select>
</div>