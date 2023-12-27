const mysql = require('mysql');

// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// scanner page
exports.scan_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // take data utilities
    let hidestaff = req.session.role == "merchant";
    let alert = req.query.alert;
    console.log('\nscan page\n')
        // render scan page
    res.render('scan-page', { hidestaff, alert })
}

// scanning
exports.scanner = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // take data utilities
    let hidestaff = req.session.role == "merchant";
    console.log('\nscanning\n')
        // render scanner page
    res.render('scanner', { hidestaff })
}

// new_scanner
exports.new_scanner = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // take data utilities
    let hidestaff = req.session.role == "merchant";
    console.log('\nscanning\n')
    res.render('new_scanner', { hidestaff })
}

// decode~
exports.decodedText = (req, res) => {
    let decodedText = req.params.decodedText;

    console.log("decodeText Page~");
    console.log("code : ", decodedText)

    if (decodedText) {
        // find ID then redirect this id to '/view/:id'
        connection.query('SELECT id FROM customer WHERE barcode_number = ?', [decodedText], (err, rows) => {
            if (!err) {
                if (rows.length != 0) {
                    console.log("this code match with ID : ", rows[0].id)
                        // redirect to 'view/:id'
                    res.redirect('/viewuser/' + rows[0].id)
                } else {
                    console.log('Cant find member match this code')
                    console.log('code :' + decodedText + ' cant find in DB');
                    console.log('pls try again\n')
                        // send message 'wrong barcode'
                    let alert = encodeURIComponent('user not found \npls try again');
                    res.redirect('/scan-page/?alert=' + alert);
                }
            } else {
                console.log('decodedText => ERR at query!');
                console.log(err);
            }
        });
    }
}


// IF wrongURL
exports.wrongUrl = (req, res) => {
        // console.log('\n 404 page not found \n');
        res.render('404')
    }
    // exit
exports.exit = (req, res) => {
    req.session.destroy();
    console.log('session destroy!');
    res.redirect('/')
}

// exports.robots = (req, res) => {
//     console.log('robots.txt')
//     // res.send('robots.txt')
//     res.sendFile(path.join(__dirname + '/../robots.txt'));
// }