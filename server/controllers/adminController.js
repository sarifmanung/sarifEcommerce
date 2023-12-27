let { countTotalRows, hashPassword, comparePassword, actionsLog } = require('./utils.js')
const mysql = require('mysql');

// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// date_format
function Date_format(date) {
    const mydate = date
    const yyyy = mydate.getFullYear();
    let mm = mydate.getMonth() + 1; // Months start at 0!
    let dd = mydate.getDate();
    // if
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    // result
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    // return back
    return formattedToday;
}

// login page
exports.login_Page = (req, res) => {
    let data = req.query.data;
    console.log('\nlogin page\n');
    res.render('index2', { data })
}

// authentication check username and password => then check role of this user
exports.auth = (req, res) => {
    let { user_name, password } = req.body;
    console.log("authenticate usernam:", user_name);
    console.log("authenticate password:", password, "\n");

    // check get username and password or not
    if (user_name && password) {
        // admin the connection
        connection.query('SELECT * FROM staff WHERE user_name = ?', [user_name], async(err, rows) => {
            // When done with the connection, release it
            if (!err) {
                if (rows.length) {
                    // correct username
                    console.log('Correct UserName')

                    // check password matches or not
                    const passwordMatches = await comparePassword(password, rows[0].password);

                    // if password matches
                    if (passwordMatches) {
                        console.log("Correct Password")

                        // Authentication Pass!
                        console.log('Authentication Pass!')
                        console.log('wellcome ', user_name)

                        // save role&fullname
                        req.session.role = rows[0].role;
                        req.session.staffFullName = rows[0].first_name + " " + rows[0].last_name

                        // use info to show details for first time @ home page
                        let info = encodeURIComponent('show details');
                        // redirect to home page
                        return res.redirect('/home/?info=' + info);
                    }
                    // if wrong password
                    else {
                        console.log("Wrong Password");
                        console.log("Reject!!!");
                        // use data to send wrong password
                        let data = encodeURIComponent('Wrong Password!');
                        return res.redirect('/?data=' + data);
                    }
                }
                // if wrong username
                else {
                    console.log('Wrong UserName')
                    console.log("Reject!!!");
                    // use data to send wrong username
                    let data = encodeURIComponent('Wrong UserName!');
                    return res.redirect('/?data=' + data);
                }
            }
            // if mysql query is got error
            else {
                console.log("mysql err")
                console.log(err);
                return res.redirect('/')
            }
        });
    } else {
        console.log('No username or password')
        return res.redirect('/')
    }
}

// show admin list
exports.show_admin_page = async(req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    if (!req.session.total_staff) {
        try {
            const count = await countTotalRows('staff');
            // keep the amount of total user
            req.session.total_staff = count;
        } catch (err) {
            console.error('Error:', err);
        }
    }

    const perPage = 20;
    const currentPage = parseInt(req.query.page || 1);
    const offset = (currentPage - 1) * perPage;
    const lastPage = Math.ceil(req.session.total_staff / perPage)

    if (currentPage > 0 && currentPage <= lastPage) {
        // User the connection
        connection.query(`SELECT * FROM staff WHERE status = "active" LIMIT ${perPage} OFFSET ${offset}`, (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                let removedUser = req.query.removed;
                let restore = req.query.restored;
                let info = req.query.info
                let name = req.query.name;
                let hidePagination = false;
                res.render('admin-list', { rows, lastPage, removedUser, restore, info, name, hidePagination });
            } else {
                console.log(err);
            }
            // console.log('The data from user table: \n', rows);
            console.log("\nAdmin List page", currentPage, "\n");
        });
    } else {
        res.redirect('/admin-list');
    }
}

// add_admin page
exports.add_admin_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    // take data utilities
    let check = req.query.check
    return res.render('add-admin', { check });
    console.log('\nCreate Admin page\n')
}

// create addmin
exports.create = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim()

    // then role = admin 
    const role = req.body.role;
    const { first_name, last_name, user_name, password, IC, DOB, phone_number, email } = req.body;
    // start checking
    // username phone email IC
    checkUsername();
    // check username
    function checkUsername() {
        connection.query('select * from staff where user_name = ?', [user_name], (err, rows) => {
            if (!err) {
                if (rows.length) {
                    console.log(rows.length)
                    console.log('username is already exist\npls try again')
                    let check = encodeURIComponent('username is already exist\npls try again');
                    res.redirect('/add_admin?check=' + check);
                    return res.end();
                }
                checkPhone();
            } else {
                console.log(err)
            }
        })
    }
    // checkPhone
    function checkPhone() {
        connection.query('select * from staff where phone_number = ?', [phone_number], (err, rows) => {
            if (!err) {
                if (rows.length) {
                    console.log(rows.length)
                    console.log('Phone number is already exist\npls try again')
                    let check = encodeURIComponent('Phone number is already exist\npls try again');
                    res.redirect('/add_admin?check=' + check);
                    return res.end();
                }
                checkEmail();
            } else {
                console.log(err)
            }
        })
    }
    // checkEmail
    function checkEmail() {
        connection.query('select * from staff where email = ?', [email], (err, rows) => {
            if (!err) {
                if (rows.length) {
                    console.log(rows.length)
                    console.log('Email is already exist\npls try again')
                    let check = encodeURIComponent('Email is already exist\npls try again');
                    res.redirect('/add_admin?check=' + check);
                    return res.end();
                }
                checkIc();
            } else {
                console.log(err)
            }
        })
    }
    // checkEmail
    function checkIc() {
        connection.query('select * from staff where IC = ?', [IC], (err, rows) => {
            if (!err) {
                if (rows.length) {
                    console.log(rows.length)
                    console.log('NRIC is already exist\npls try again')
                    let check = encodeURIComponent('NRIC is already exist\npls try again');
                    res.redirect('/add_admin?check=' + check);
                    return res.end();
                }
                saveNewStaff();
            } else {
                console.log(err)
            }
        })
    }

    // save new staff
    async function saveNewStaff() {
        // hash password
        let hash_password = await hashPassword(password)
        connection.query('INSERT INTO staff SET first_name = ?, last_name = ?,user_name = ?, password = ?, IC = ?, DOB = ?,phone_number = ?, email = ?, role = ?', [first_name, last_name, user_name, hash_password, IC, DOB, phone_number, email, role], (err, rows) => {
            if (!err) {
                console.log('created ' + role + ' name : ' + first_name);
                let name = encodeURIComponent('created ' + role + ' name : ' + first_name);

                // save the actions
                let details = { "StaffName": first_name + " " + last_name, "UserName": user_name, "Role": role }
                actionsLog("CreateNewStaff", req.session.staffFullName, ip, details)

                return res.redirect('/admin-list?name=' + name);
            } else {
                console.error(err);
                return res.redirect('/admin-list')
            }
            // console.log('The data from customer table: \n', rows);
        });

    }
}

// View Admin
exports.admin_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    let id = req.params.id
        // check in DB first
    connection.query('SELECT id FROM staff WHERE id = ?', [id], (err, rows) => {
        // console.log(rows.length)
        if (rows.length != 0) {
            // User the connection
            connection.query('SELECT * , DATE_FORMAT( DOB , ? ) as DOB_format ,' +
                ' DATE_FORMAT( ts , ? ) as ts_format ' +
                ' FROM staff WHERE id = ?', ['%d/%m/%Y', '%d/%m/%Y', id]
                // connection.query('SELECT * FROM staff WHERE id = ?', [id]
                , (err, rows) => {
                    if (!err) {
                        console.log('\ndetials of : ' + rows[0].first_name + '\n')
                        res.render('admin-view', { rows });
                    } else {
                        console.log(err);
                    }
                    // console.log('data of this user: \n', rows);
                });
        } else {
            console.log('Cant find member with this barcode')
            console.log('id :' + id + ' cant find in DB');
            console.log('pls try agai\n')
            res.redirect('/scan-page')
        }
    });
}

// Delete Admin
exports.delete = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim()

    // progress
    connection.query('UPDATE staff SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
        if (!err) {
            let removedUser = encodeURIComponent('\nID:' + req.params.id + ' successeflly removed.\n');

            // save the actions
            let details = { "StaffID": req.params.id }
            actionsLog("DeleteStaff", req.session.staffFullName, ip, details)

            console.log(removedUser)
            return res.redirect('/admin-list?removed=' + removedUser);
        } else {
            console.error(err);
        }
    });
}

// Edit Admin
exports.edit_admin_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    // take data utilities
    let check = req.query.check
        // User the connection
    connection.query('SELECT * FROM staff WHERE id = ?', [req.params.id], (err, rows) => {
        if (!err) {
            console.log("\nedit admin\n id : " + [req.params.id])
            let format_DOB = Date_format(rows[0].DOB)
            res.render('admin-edit', { rows, format_DOB, check });
        } else {
            console.log(err);
        }
        // console.log('The data from user table: \n', rows);
    });
}

// Update Admin
exports.update = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim()

    const role = req.body.role;
    const { first_name, last_name, user_name, password, IC, DOB, phone_number, email } = req.body;

    // start checking
    checkUsername();

    // checkUsername
    function checkUsername() {
        // check that user_name got change or not?
        connection.query('select user_name from staff where id = ?', [req.params.id], (err, rows) => {
            if (!err) {
                // if user_name not change go check other
                if (rows[0].user_name == user_name) {
                    console.log("user_name is not change")
                    checkPhone();
                    return res.end;
                }
                // if user_name got changed, go check got duplicate with other user user_name or not!!!!
                else {
                    console.log("user_name is got changed")
                        // check is new user_name already had @ DB or not, if not duplicated => can add, else => reject to edit page
                    connection.query('select user_name from staff where user_name = ?', [user_name], (err, rows) => {
                        if (!err) {
                            console.log(rows.length)
                                // user_name is already exit reject~
                            if (rows.length > 0) {
                                console.log('username is already exist\npls try again')
                                let check = encodeURIComponent('username is already exist\npls try again');
                                res.redirect('/editadmin/' + req.params.id + '?check=' + check);
                                return res.end();
                            }
                            // user_name not duplicate check other next~
                            else {
                                checkPhone();
                                return res.end;
                            }
                        }
                        // if got err @ query throw err
                        else {
                            console.log(err)
                        }
                    })
                }
            }
            // if got err @ query throw err
            else {
                console.log(err)
            }
        })
    }
    // checkPhone
    function checkPhone() {
        // check that phone_number got change or not?
        connection.query('select phone_number from staff where id = ?', [req.params.id], (err, rows) => {
            if (!err) {
                // if phone_number not change go check other
                if (rows[0].phone_number == phone_number) {
                    console.log("phone_number is not change")
                    checkEmail();
                    return res.end;
                }
                // if phone_number got changed, go check got duplicate with other user phone_number or not!!!!
                else {
                    console.log("phone_number is got changed")
                        // check is new phone_number already had @ DB or not, if not duplicated => can add, else => reject to edit page
                    connection.query('select phone_number from staff where phone_number = ?', [phone_number], (err, rows) => {
                        if (!err) {
                            console.log(rows.length)
                                // phone_number is already exit reject~
                            if (rows.length > 0) {
                                console.log('phone number is already exist\npls try again')
                                let check = encodeURIComponent('phone number is already exist\npls try again');
                                res.redirect('/editadmin/' + req.params.id + '?check=' + check);
                                return res.end();
                            }
                            // phone_number not duplicate check other next~
                            else {
                                checkEmail();
                                return res.end;
                            }
                        }
                        // if got err @ query throw err
                        else {
                            console.log(err)
                        }
                    })
                }
            }
            // if got err @ query throw err
            else {
                console.log(err)
            }
        })
    }
    // checkEmail
    function checkEmail() {
        // check that email got change or not?
        connection.query('select email from staff where id = ?', [req.params.id], (err, rows) => {
            if (!err) {
                // if email not change go check other
                if (rows[0].email == email) {
                    console.log("email is not change")
                    checkIC();
                    return res.end;
                }
                // if email got changed, go check got duplicate with other user email or not!!!!
                else {
                    console.log("email is got changed")
                        // check is new email already had @ DB or not, if not duplicated => can add, else => reject to edit page
                    connection.query('select email from staff where email = ?', [email], (err, rows) => {
                        if (!err) {
                            console.log(rows.length)
                                // email is already exit reject~
                            if (rows.length > 0) {
                                console.log('email is already exist\npls try again')
                                let check = encodeURIComponent('Email is already exist\npls try again');
                                res.redirect('/editadmin/' + req.params.id + '?check=' + check);
                                return res.end();
                            }
                            // email not duplicate check other next~
                            else {
                                checkIC();
                                return res.end;
                            }
                        }
                        // if got err @ query throw err
                        else {
                            console.log(err)
                        }
                    })
                }
            }
            // if got err @ query throw err
            else {
                console.log(err)
            }
        })
    }
    // checkIC
    function checkIC() {
        // check that IC got change or not?
        connection.query('select IC from staff where id = ?', [req.params.id], (err, rows) => {
            if (!err) {
                // if IC not change go check other
                if (rows[0].IC == IC) {
                    console.log("IC is not change")
                    updateStaff();
                    return res.end;
                }
                // if IC got changed, go check got duplicate with other user IC or not!!!!
                else {
                    console.log("IC is got changed")
                        // check is new IC already had @ DB or not, if not duplicated => can add, else => reject to edit page
                    connection.query('select IC from staff where IC = ?', [IC], (err, rows) => {
                        if (!err) {
                            console.log(rows.length)
                                // IC is already exit reject~
                            if (rows.length > 0) {
                                console.log('IC is already exist\npls try again')
                                let check = encodeURIComponent('IC is already exist\npls try again');
                                res.redirect('/editadmin/' + req.params.id + '?check=' + check);

                                return res.end();
                            }
                            // IC not duplicate check other next~
                            else {
                                updateStaff();
                                return res.end;
                            }
                        }
                        // if got err @ query throw err
                        else {
                            console.log(err)
                        }
                    })
                }

            }
            // if got err @ query throw err
            else {
                console.log(err)
            }
        })
    }
    // update staff!
    async function updateStaff() {
        let sql = 'UPDATE staff SET first_name = ?, last_name = ?, user_name = ?, IC = ?, DOB = ?, phone_number = ?, email = ?, role = ?';
        let value = [first_name, last_name, user_name, IC, DOB, phone_number, email, role, req.params.id];

        if (password) {
            let hash_password = await hashPassword(password)
            sql += ', password = ?'
            value = [first_name, last_name, user_name, IC, DOB, phone_number, email, role, hash_password, req.params.id];
        }
        sql += ' WHERE id = ?'

        connection.query(sql, value, (err, rows) => {
            // if not err
            if (!err) {
                // User the connection
                connection.query('SELECT * FROM staff WHERE id = ?', [req.params.id], (err, rows) => {
                    // When done with the connection, release it
                    if (!err) {
                        let format_DOB = Date_format(rows[0].DOB)

                        // save the actions
                        let details = { "StaffName": first_name + " " + last_name, "UserName": user_name, "Role": role }
                        actionsLog("UpdateStaff", req.session.staffFullName, ip, details)

                        return res.render('admin-edit', { rows, format_DOB, alert: `${first_name} has been updated.` });
                    } else {
                        console.error(err);
                    }
                    console.log(`${first_name} has been updated.\n`)
                });
            } else {
                console.error(err);
            }
            // console.log('The data from customer table: \n', rows);
        });
    }
}

// Show hide admin
exports.hideAdmin_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    // User the connection
    connection.query('SELECT * FROM staff WHERE status = "removed"', (err, rows) => {
        // When done with the connection, release it
        if (!err) {
            let removedUser = req.query.removed;
            res.render('deleted-admin', { rows, removedUser });
        } else {
            console.log(err);
        }
        // console.log('The data from user table: \n', rows);
        console.log("\nshow all deleted admin (page)\n");
    });
}

// Restore Admin
exports.restore = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim()

    connection.query('UPDATE staff SET status = ? WHERE id = ?', ['active', req.params.id], (err, rows) => {
        if (!err) {
            let restored = encodeURIComponent('admin id:' + req.params.id + ' successeflly restored.');

            // save the actions
            let details = { "StaffID": req.params.id }
            actionsLog("RestoreStaff", req.session.staffFullName, ip, details)

            console.log('restore done (id:' + req.params.id + ')')
            return res.redirect('/admin-list?restored=' + restored);
        } else {
            console.error(err);
        }
    });
}

// white_list page
exports.white_list = async(req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        return res.redirect('/exit')
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    if (!req.session.total_white_list) {
        try {
            const count = await countTotalRows('white_list');
            // keep the amount of total white_list
            req.session.total_white_list = count;
        } catch (err) {
            console.error('Error:', err);
        }
    }

    const perPage = 20;
    const currentPage = parseInt(req.query.page || 1);
    const offset = (currentPage - 1) * perPage;
    const lastPage = Math.ceil(req.session.total_white_list / perPage)

    if (currentPage > 0 && currentPage <= lastPage) {
        // User the connection
        connection.query(`SELECT * FROM white_list LIMIT ${perPage} OFFSET ${offset}`, (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                let hidePagination = false
                res.render('white_list', { rows, lastPage, hidePagination });
            } else {
                console.log(err);
            }
            console.log("\nWhite List page ", currentPage, "\n");
        });
    } else {
        res.redirect('/white_list');
    }
}

// search_staff
exports.search_staff = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        res.redirect('/')
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    // take data utilities
    let hidestaff = req.session.role == "merchant";
    let x = req.body.search;
    let hidePagination = true;

    // User the connection
    connection.query('SELECT * FROM staff WHERE first_name LIKE ? OR last_name LIKE ? OR user_name LIKE ? OR role LIKE ? OR DOB LIKE ? OR IC LIKE ? OR phone_number LIKE ? OR email LIKE ?', ['%' + x + '%', '%' + x + '%', '%' + x + '%', '%' + x + '%', '%' + x + '%', '%' + x + '%', '%' + x + '%', '%' + x + '%'], (err, rows) => {
        if (!err) {
            console.log("result~")
            res.render('admin-list', { rows, hidestaff, hidePagination });
        } else {
            console.log(err);
        }
        // console.log('The data from staff table: \n', rows);
    });
}

//search_white_list
exports.search_white_list = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log('pls login first')
        console.log('reject!')
        res.redirect('/')
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner")
        console.log("redirect to scanner page")
        return res.redirect('/scan-page');
    }

    // take data utilities
    let hidestaff = req.session.role == "merchant";
    let x = req.body.search;
    // User the connection
    connection.query('SELECT * FROM white_list WHERE name LIKE ? OR phone_number LIKE ? OR app_id_number LIKE ?', ['%' + x + '%', '%' + x + '%', '%' + x + '%'], (err, rows) => {
        if (!err) {
            let hidePagination = true
            console.log("result~")
            res.render('white_list', { rows, hidestaff, hidePagination });
        } else {
            console.log(err);
        }
        // console.log('The data from staff table: \n', rows);
    });
}