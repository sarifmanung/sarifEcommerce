const mysql = require('mysql');
const path = require('path')
let { checkPhoneList, checkPhoneCustomer, checkIC, checkEmail, checkApp_id_number, saveNewCustomer, Date_format } = require('./utils.js')

// Connection Pool
let db = mysql.createConnection({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: 'utf8mb4',
});

// Register page
exports.register_Page = (req, res) => {

    console.log('\nregister page\n')
    let alert = req.query.alert;
    res.render('register', { alert });
}

// post register new rows
exports.register_create = async (req, res) => {
    try {
        const { first_name, last_name, IC, DOB, phone_number, email, app_id_number } = req.body;

        if (!first_name || !last_name || !IC || !DOB || !phone_number || !email || !app_id_number) {
            res.status(400).send("Missing required fields");
            return;
        }

        // get new object date
        const dateObj = new Date(DOB);
        DOB_format = Date_format(dateObj)

        // check phone exit on white_list ornot
        const phoneListExists = await checkPhoneList(phone_number);

        // cant find phone, then reject
        if (phoneListExists === false) {
            let message = 'This phone (' + phone_number + ') is not exists on white list'
            console.log(message);
            return res.render('register', { message, first_name, last_name, IC, DOB_format, phone_number, email, app_id_number });
        }

        // check phone exit on customer ornot, if got on customer reject
        const phoneCusExists = await checkPhoneCustomer(phone_number);

        if (phoneCusExists) {
            let message = 'This phone (' + phone_number + ') already exists on our member'
            console.log(message);
            return res.render('register', { message, first_name, last_name, IC, DOB_format, phone_number, email, app_id_number });
        }

        /*              
       // check IC exit on customer table or not
         const icExists = await checkIC(IC);
  
          if (icExists) {
              let message = 'This IC (' + IC + ') already exists'
              console.log(message);
              return res.redirect('/register?alert=' + message);
          }
  
          // check email exit on customer table or not
          const emailExists = await checkEmail(email);
  
          if (emailExists) {
              let message = 'This email (' + email + ') already exists'
              console.log(message);
              return res.redirect('/register?alert=' + message);
          }
  
          // check email exit on customer table or not
          const appIdNmberExists = await checkApp_id_number(app_id_number);
  
          if (appIdNmberExists) {
              let message = 'This App ID number (' + app_id_number + ') already exists'
              console.log(message);
              return res.redirect('/register?alert=' + message);
          } 
          */

        // phone number math with white_list then can insert
        // save new rows to customer
        const rows = await saveNewCustomer(first_name, last_name, IC, DOB, phone_number, email, app_id_number);

        console.log('register complete\n', rows);
        return res.redirect('/register/thank-you?alert=' + 'register complete~');

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
}

// get Header section
exports.header_page = function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../views/html/header.html'))
}

// get /register/thank-you page
exports.register_thanks_you = function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../views/html/register_thanks_you.html'))
}