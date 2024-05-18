const joi = require('joi');

const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
});

const CustomerRegInfo = joi.object(
).options({ abortEarly: false }).keys({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    gender: joi.string().required().valid('Male', 'Female', 'Other'),
    dob: joi.string().required(),
    contactNo: joi.string().trim().required().label('Contact Number'),
    passportNo: joi.string().required().label('Passport Number'),
    city: joi.string().required(),
    addressLine1: joi.string().required(),
    password: joi.string().min(5).required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required().label('Password Conformation'),
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
});

const flightSchema = joi.object({
    flight_name: joi.string().required(),
    depart_from: joi.string().required(),
    arrive_at: joi.string().required(),
    takeoff_time: joi.string().isoDate().required(),
    landing_time: joi.string().isoDate().required(),
    price: joi.number().required(),
    no_seats: joi.number().required(),
});


module.exports = { registerSchema, loginSchema, CustomerRegInfo, flightSchema };