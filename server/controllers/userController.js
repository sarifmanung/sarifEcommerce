let { Date_format, countTotalRows, actionsLog } = require("./utils.js");
const mysql = require("mysql");

// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// View Users
exports.showusers_Page = async(req, res) => {

    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        return res.redirect("/");
    }

    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("\nyou role : " + req.session.role + "\n");
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // take data utilities
    let removedUser = req.query.removed;
    let restore = req.query.restored;
    let info = req.query.info;
    let hidestaff = req.session.role == "merchant";
    let alerted = req.query.alert;
    hidePagination = false;

    // if login success
    if (info) console.log("\nyou role : " + req.session.role + "\n");

    if (!req.session.total_user) {
        try {
            const count = await countTotalRows("customer");
            // keep the amount of total user
            req.session.total_user = count;
        } catch (err) {
            console.error("Error:", err);
        }
    }

    const perPage = 20;
    const currentPage = parseInt(req.query.page || 1);
    const offset = (currentPage - 1) * perPage;
    const lastPage = Math.ceil(req.session.total_user / perPage);

    if (currentPage > 0 && currentPage <= lastPage) {
        // User the connection
        connection.query(
            `SELECT * FROM customer WHERE status = "active" LIMIT ${perPage} OFFSET ${offset}`,
            (err, rows) => {
                // When done with the connection, release it
                if (!err) {
                    res.render("home", {
                        rows,
                        lastPage,
                        removedUser,
                        restore,
                        info,
                        hidestaff,
                        alerted,
                        hidePagination,
                    });
                } else {
                    console.log(err);
                }
                console.log("\nmembership page ", currentPage, "\n");
            }
        );
    } else {
        res.redirect("/home");
    }
};

// Find User by Search
exports.search_customer = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // take data utilities
    let hidestaff = req.session.role == "merchant";
    hidePagination = true;
    let x = req.body.search;
    // User the connection
    connection.query(
        'SELECT * FROM customer WHERE (first_name LIKE ? OR last_name LIKE ? OR IC LIKE ? OR app_id_number LIKE ? OR phone_number LIKE ? OR email LIKE ?) AND status = "active"', [
            "%" + x + "%",
            "%" + x + "%",
            "%" + x + "%",
            "%" + x + "%",
            "%" + x + "%",
            "%" + x + "%",
        ],
        (err, rows) => {
            if (!err) {
                console.log("result~");
                res.render("home", { rows, hidestaff, hidePagination });
            } else {
                console.log(err);
            }
            // console.log('The data from customer table: \n', rows);
        }
    );
};

// Add user Page
exports.add_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // take data utilities
    let check = req.query.check;
    let hidestaff = req.session.role == "merchant";
    console.log("\nAdd page\n");
    res.render("add-user", { hidestaff, check });
};

// Add new user
exports.create = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }
    ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
        .split(",")[0]
        .trim();
    const {
        first_name,
        last_name,
        barcode_number,
        app_id_number,
        IC,
        DOB,
        phone_number,
        email,
        treatment_start_date,
        treatment_end_date,
        membership_expire_date,
    } = req.body;
    // starting checking
    checkAppID();

    function checkAppID() {
        connection.query(
            "select * from customer where app_id_number = ?", [app_id_number],
            (err, rows) => {
                if (!err) {
                    if (rows.length) {
                        let check = "App ID number is already exist pls try again";
                        console.log(check);
                        return res.render("add-user", {
                            check,
                            first_name,
                            last_name,
                            barcode_number,
                            app_id_number,
                            IC,
                            DOB,
                            phone_number,
                            email,
                            treatment_start_date,
                            treatment_end_date,
                            membership_expire_date,
                        });
                    }
                    checkIC();
                } else {
                    console.error(err);
                }
            }
        );
    }

    function checkIC() {
        connection.query(
            "select * from customer where IC = ?", [IC],
            (err, rows) => {
                if (!err) {
                    if (rows.length) {
                        let check = "IC is already exist pls try again";
                        console.log(check);
                        return res.render("add-user", {
                            check,
                            first_name,
                            last_name,
                            barcode_number,
                            app_id_number,
                            IC,
                            DOB,
                            phone_number,
                            email,
                            treatment_start_date,
                            treatment_end_date,
                            membership_expire_date,
                        });
                    }
                    checkPhone();
                } else {
                    console.error(err);
                }
            }
        );
    }

    function checkPhone() {
        connection.query(
            "select * from customer where phone_number = ?", [phone_number],
            (err, rows) => {
                if (!err) {
                    if (rows.length) {
                        let check = "this phone number is already exist pls try again";
                        console.log(check);
                        return res.render("add-user", {
                            check,
                            first_name,
                            last_name,
                            barcode_number,
                            app_id_number,
                            IC,
                            DOB,
                            phone_number,
                            email,
                            treatment_start_date,
                            treatment_end_date,
                            membership_expire_date,
                        });
                    }
                    checkEmail();
                } else {
                    console.error(err);
                }
            }
        );
    }

    function checkEmail() {
        connection.query(
            "select * from customer where email = ?", [email],
            (err, rows) => {
                if (!err) {
                    if (rows.length) {
                        let check = "Email is already exist pls try again";
                        console.log(check);
                        return res.render("add-user", {
                            check,
                            first_name,
                            last_name,
                            barcode_number,
                            app_id_number,
                            IC,
                            DOB,
                            phone_number,
                            email,
                            treatment_start_date,
                            treatment_end_date,
                            membership_expire_date,
                        });
                    }
                    insert_new_user();
                } else {
                    console.error(err);
                }
            }
        );
    }

    function checkBarcode_number() {
        connection.query(
            "select * from customer where barcode_number = ?", [barcode_number],
            (err, rows) => {
                if (!err) {
                    if (rows.length) {
                        let check = "this Barcode is already exist pls try again";
                        console.log(check);
                        return res.render("add-user", {
                            check,
                            first_name,
                            last_name,
                            barcode_number,
                            app_id_number,
                            IC,
                            DOB,
                            phone_number,
                            email,
                            treatment_start_date,
                            treatment_end_date,
                            membership_expire_date,
                        });
                    }
                    insert_new_user();
                } else {
                    console.error(err);
                }
            }
        );
    }

    // insert data to DB
    function insert_new_user() {
        // console.log("called insert_new_user() ~")
        // res.send("called insert_new_user() ~")
        connection.query(
            "INSERT INTO customer SET first_name = ?, last_name = ?, barcode_number = ?, IC = ?, DOB = ?,phone_number = ?, email = ?, treatment_start_date = ?, treatment_end_date = ?, membership_expire_date = ?, app_id_number = ?", [
                first_name,
                last_name,
                barcode_number,
                IC,
                DOB,
                phone_number,
                email,
                treatment_start_date,
                treatment_end_date,
                membership_expire_date,
                app_id_number,
            ],
            (err, rows) => {
                if (!err) {
                    // save the actions
                    let details = {
                        Username: first_name + " " + last_name,
                        app_id_number: app_id_number,
                    };
                    actionsLog("CreateNewUser", req.session.staffFullName, ip, details);

                    let alert = encodeURIComponent(
                        "\nCreate New User : " + first_name + "\n"
                    );
                    console.log("added new user : " + first_name + " " + last_name);
                    return res.redirect("/home?alert=" + alert);
                } else {
                    console.error(err);
                }
            }
        );
    }
};

// Edit user
exports.edit_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // take data utilities
    let check = req.query.check;
    let hidestaff = req.session.role == "merchant";
    // User the connection
    connection.query(
        "SELECT * FROM customer WHERE id = ?", [req.params.id],
        (err, rows) => {
            if (!err) {
                // take data utilities
                let format_DOB = Date_format(rows[0].DOB);
                let format_treatment_start_date = Date_format(
                    rows[0].treatment_start_date
                );
                let format_treatment_end_date = Date_format(rows[0].treatment_end_date);
                let format_membership_expire_date = Date_format(
                    rows[0].membership_expire_date
                );

                res.render("edit-user", {
                    rows,
                    check,
                    hidestaff,
                    format_DOB,
                    format_treatment_start_date,
                    format_treatment_end_date,
                    format_membership_expire_date,
                });
            } else {
                console.log(err);
            }
            console.log("\nedit page\n id : " + [req.params.id]);
            // console.log('The data from user table: \n', rows);
        }
    );
};

// Update User
exports.update = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
        .split(",")[0]
        .trim();

    const {
        first_name,
        last_name,
        barcode_number,
        IC,
        app_id_number,
        DOB,
        phone_number,
        email,
        treatment_start_date,
        treatment_end_date,
        membership_expire_date,
    } = req.body;

    // start checking
    checkAppID();

    // check app_id_number
    function checkAppID() {
        // check that app_id_number got change or not?
        connection.query(
            "select app_id_number from customer where id = ?", [req.params.id],
            (err, rows) => {
                if (!err) {
                    // if app_id_number not change go check other
                    if (rows[0].app_id_number == app_id_number) {
                        console.log("app_id_number is not change");
                        checkIC();
                        return res.end;
                    }
                    // if app_id_number got changed, go check got duplicate with other user app_id_number or not!!!!
                    else {
                        console.log("app_id_number is got changed");
                        // check is new app_id_number already had @ DB or not, if not duplicated => can add, else => reject to edit page
                        connection.query(
                            "select app_id_number from customer where app_id_number = ?", [app_id_number],
                            (err, rows) => {
                                if (!err) {
                                    console.log(rows.length);
                                    // app_id_number is already exit reject~
                                    if (rows.length > 0) {
                                        console.log(
                                            "app_id_number is already exist\npls try again"
                                        );
                                        let check = encodeURIComponent(
                                            "app_id_number is already exist\npls try again"
                                        );
                                        res.redirect(
                                            "/edituser/" + req.params.id + "?check=" + check
                                        );
                                        return res.end();
                                    }
                                    // app_id_number not duplicate Can update USER ~
                                    else {
                                        checkIC();
                                        return res.end;
                                    }
                                }
                                // if got err @ query throw err
                                else {
                                    console.log(err);
                                }
                            }
                        );
                    }
                }
                // if got err @ query throw err
                else {
                    console.log(err);
                }
            }
        );
    }

    // check IC
    function checkIC() {
        // check that IC got change or not?
        connection.query(
            "select IC from customer where id = ?", [req.params.id],
            (err, rows) => {
                if (!err) {
                    // if IC not change go check other
                    if (rows[0].IC == IC) {
                        console.log("IC is not change");
                        checkPhone();
                        return res.end;
                    }
                    // if IC got changed, go check got duplicate with other user IC or not!!!!
                    else {
                        console.log("IC is got changed");
                        // check is new IC already had @ DB or not, if not duplicated => can add, else => reject to edit page
                        connection.query(
                            "select IC from customer where IC = ?", [IC],
                            (err, rows) => {
                                if (!err) {
                                    console.log(rows.length);
                                    // IC is already exit reject~
                                    if (rows.length > 0) {
                                        console.log("IC is already exist\npls try again");
                                        let check = encodeURIComponent(
                                            "IC is already exist\npls try again"
                                        );
                                        res.redirect(
                                            "/edituser/" + req.params.id + "?check=" + check
                                        );

                                        return res.end();
                                    }
                                    // IC not duplicate check other next~
                                    else {
                                        checkPhone();
                                        return res.end;
                                    }
                                }
                                // if got err @ query throw err
                                else {
                                    console.log(err);
                                }
                            }
                        );
                    }
                }
                // if got err @ query throw err
                else {
                    console.log(err);
                }
            }
        );
    }

    // check Phone
    function checkPhone() {
        // check that phone_number got change or not?
        connection.query(
            "select phone_number from customer where id = ?", [req.params.id],
            (err, rows) => {
                if (!err) {
                    // if phone_number not change go check other
                    if (rows[0].phone_number == phone_number) {
                        console.log("phone_number is not change");
                        checkEmail();
                        return res.end;
                    }
                    // if phone_number got changed, go check got duplicate with other user phone_number or not!!!!
                    else {
                        console.log("phone_number is got changed");
                        // check is new phone_number already had @ DB or not, if not duplicated => can add, else => reject to edit page
                        connection.query(
                            "select phone_number from customer where phone_number = ?", [phone_number],
                            (err, rows) => {
                                if (!err) {
                                    console.log(rows.length);
                                    // phone_number is already exit reject~
                                    if (rows.length > 0) {
                                        console.log("phone_number is already exist\npls try again");
                                        let check = encodeURIComponent(
                                            "phone number is already exist\npls try again"
                                        );
                                        res.redirect(
                                            "/edituser/" + req.params.id + "?check=" + check
                                        );
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
                                    console.log(err);
                                }
                            }
                        );
                    }
                }
                // if got err @ query throw err
                else {
                    console.log(err);
                }
            }
        );
    }

    // check Email
    function checkEmail() {
        // check that email got change or not?
        connection.query(
            "select email from customer where id = ?", [req.params.id],
            (err, rows) => {
                if (!err) {
                    // if email not change go check other
                    if (rows[0].email == email) {
                        console.log("email is not change");
                        updateUser();
                        return res.end;
                    }
                    // if email got changed, go check got duplicate with other user email or not!!!!
                    else {
                        console.log("email is got changed");
                        // check is new email already had @ DB or not, if not duplicated => can add, else => reject to edit page
                        connection.query(
                            "select email from customer where email = ?", [email],
                            (err, rows) => {
                                if (!err) {
                                    console.log(rows.length);
                                    // email is already exit reject~
                                    if (rows.length > 0) {
                                        console.log("email is already exist\npls try again");
                                        let check = encodeURIComponent(
                                            "Email is already exist\npls try again"
                                        );
                                        res.redirect(
                                            "/edituser/" + req.params.id + "?check=" + check
                                        );
                                        return res.end();
                                    }
                                    // email not duplicate check other next~
                                    else {
                                        updateUser();
                                        return res.end;
                                    }
                                }
                                // if got err @ query throw err
                                else {
                                    console.log(err);
                                }
                            }
                        );
                    }
                }
                // if got err @ query throw err
                else {
                    console.log(err);
                }
            }
        );
    }

    // check Barcode Number
    function checkBarcode() {
        // check that barcode_number got change or not?
        connection.query(
            "select barcode_number from customer where id = ?", [req.params.id],
            (err, rows) => {
                if (!err) {
                    // if barcode_number not change go check other
                    if (rows[0].barcode_number == barcode_number) {
                        console.log("barcode_number is not change");
                        updateUser();
                        return res.end;
                    }
                    // if barcode_number got changed, go check got duplicate with other user barcode_number or not!!!!
                    else {
                        console.log("barcode_number is got changed");
                        // check is new barcode_number already had @ DB or not, if not duplicated => can add, else => reject to edit page
                        connection.query(
                            "select barcode_number from customer where barcode_number = ?", [barcode_number],
                            (err, rows) => {
                                if (!err) {
                                    console.log(rows.length);
                                    // barcode_number is already exit reject~
                                    if (rows.length > 0) {
                                        console.log(
                                            "barcode_number is already exist\npls try again"
                                        );
                                        let check = encodeURIComponent(
                                            "barcode_number is already exist\npls try again"
                                        );
                                        res.redirect(
                                            "/edituser/" + req.params.id + "?check=" + check
                                        );
                                        return res.end();
                                    }
                                    // barcode_number not duplicate Can update USER ~
                                    else {
                                        updateUser();
                                        return res.end;
                                    }
                                }
                                // if got err @ query throw err
                                else {
                                    console.log(err);
                                }
                            }
                        );
                    }
                }
                // if got err @ query throw err
                else {
                    console.log(err);
                }
            }
        );
    }

    // update user
    function updateUser() {
        console.log("update USER!!!!");

        connection.query(
            "UPDATE customer SET first_name = ?, last_name = ?, barcode_number = ?, app_id_number = ?, IC = ?, DOB = ?,phone_number = ?, email = ?, treatment_start_date = ?, treatment_end_date = ?, membership_expire_date = ? WHERE id = ?", [
                first_name,
                last_name,
                barcode_number,
                app_id_number,
                IC,
                DOB,
                phone_number,
                email,
                treatment_start_date,
                treatment_end_date,
                membership_expire_date,
                req.params.id,
            ],
            (err, rows) => {
                // When done with the connection, release it
                if (!err) {
                    let alert = encodeURIComponent(
                        "\n" + first_name + " has been updated.\n"
                    );
                    // save the actions
                    let details = {
                        Username: first_name + " " + last_name,
                        app_id_number: app_id_number,
                    };
                    actionsLog("UpdateUser", req.session.staffFullName, ip, details);

                    console.log(alert);
                    return res.redirect("/home?alert=" + alert);
                } else {
                    console.error(err);
                }
                // console.log('The data from customer table: \n', rows);
            }
        );
    }
};

// Delete User
exports.delete = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
        .split(",")[0]
        .trim();

    // Delete a record
    // User the connection
    // connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {
    //   if(!err) {
    //     res.redirect('/');
    //   } else {
    //     console.log(err);
    //   }
    //   console.log('The data from user table: \n', rows);
    // });

    // Hide a record
    connection.query(
        "UPDATE customer SET status = ? WHERE id = ?", ["removed", req.params.id],
        (err, rows) => {
            if (!err) {
                let removedUser = encodeURIComponent(
                    "\ncustomer successeflly removed.\n"
                );

                // save the actions
                let details = { UserID: req.params.id };
                actionsLog("DeleteUser", req.session.staffFullName, ip, details);

                console.log(removedUser);
                return res.redirect("/home?removed=" + removedUser);
            } else {
                console.log(err);
            }
            // console.log('The data from beer table are: \n', rows);
        }
    );
};

// Restore User
exports.restore = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
        .split(",")[0]
        .trim();

    connection.query(
        "UPDATE customer SET status = ? WHERE id = ?", ["active", req.params.id],
        (err, rows) => {
            if (!err) {
                // take data utilities
                let restored = encodeURIComponent("customer successfully restored.");
                console.log("restore done (id:" + req.params.id + ")");

                // save the actions
                let details = { UserID: req.params.id };
                actionsLog("RestoreUser", req.session.staffFullName, ip, details);

                return res.redirect("/home?restored=" + restored);
                // res.redirect('/display-hide-user')
            } else {
                console.log(err);
            }
            console.log("restore done~\n");
            // console.log('The data from beer table are: \n', rows);
        }
    );
};

// View Users
exports.user_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }

    let id = req.params.id;
    // check in DB first
    connection.query(
        "SELECT id FROM customer WHERE id = ?", [id],
        (err, rows) => {
            // console.log(rows.length)
            if (rows.length != 0) {
                // User the connection
                connection.query(
                    "SELECT * , DATE_FORMAT( DOB , ? ) as DOB_format ," +
                    " DATE_FORMAT( treatment_start_date , ? ) as treatment_start_date_format ," +
                    " DATE_FORMAT( treatment_end_date , ? ) as treatment_end_date_format ," +
                    " DATE_FORMAT( membership_expire_date , ? ) as membership_expire_date_format ," +
                    " DATE_FORMAT( ts , ? ) as ts_format " +
                    " FROM customer WHERE id = ?", ["%d/%m/%Y", "%d/%m/%Y", "%d/%m/%Y", "%d/%m/%Y", "%d/%m/%Y", id],
                    (err, rows) => {
                        if (!err) {
                            console.log("\ndetials of : " + rows[0].first_name + "\n");
                            // take data utilities
                            let hidestaff = req.session.role == "merchant";
                            // if role = merchant
                            if (hidestaff) {
                                res.render("view-user-merchant", { rows, hidestaff });
                                return res.end;
                            }
                            res.render("view-user", { rows, hidestaff });
                        } else {
                            console.log(err);
                        }
                        // console.log('data of this user: \n', rows);
                    }
                );
            } else {
                console.log("Cant find member with this barcode");
                console.log("id :" + id + " cant find in DB");
                console.log("pls try agai\n");
                res.redirect("/scan-page");
            }
        }
    );
};

// Show hide user
exports.hideUser_Page = (req, res) => {
    // if come this URL with no authentication reject him!
    if (!req.session.role) {
        console.log("pls login first");
        console.log("reject!");
        res.redirect("/");
        return res.end;
    }
    // check if role => merchant will redirect to scan page straight
    if (req.session.role == "merchant") {
        console.log("merchant can only use scanner");
        console.log("redirect to scanner page");
        return res.redirect("/scan-page");
    }

    // User the connection
    connection.query(
        'SELECT * FROM customer WHERE status = "removed"',
        (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                // take data utilities
                let hidestaff = req.session.role == "merchant";
                let removedUser = req.query.removed;
                res.render("deleted-user", { rows, removedUser, hidestaff });
            } else {
                console.log(err);
            }
            // console.log('The data from user table: \n', rows);
            console.log("\nshow all deleted user (page)\n");
        }
    );
};

// test_date_format
exports.test_date_format = (req, res) => {
    connection.query(
        "SELECT DATE_FORMAT( DOB , ? ) as format_date FROM customer WHERE id = ?", ["%d/%m/%Y", 1],
        (err, rows) => {
            if (!err) {
                console.log(rows[0].format_date);
                res.render("test_date_format", { rows });
            } else {
                console.log(err);
            }
        }
    );
};