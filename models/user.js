const db = require("../db");
const bcrypt = require("bcrypt");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/ExpressError");
const { delete } = require("../routes/jobs");

const BCRYPT_WORK_FACTOR = 10;

class User {
    static async authenticate(data){
        const result = await db.query(
            `SELECT username, 
                    password,
                    fist_time,
                    email,
                    photo_url,
                    is_admin
                FROM users
                WHERE username = $1,`
                [data.username]
        );
        const user = result.rows[0];

        if(user){
            const isValid = await bcrypt.compare(data.password, user.password);
            if (isValid){
                return user;
            }
        }
        throw ExpressError("Invalid password", 401);
    }

    static async findAll(){
        const result = await db.query(
            `SELECT username, first_name, last_name, email
                FROM users
                ORDER BY username
            `
        );
        return result.rows;
    }

    static async findOne(username){
        const userRes = await db.query(
            `SELECT username, first_name, last_name, photo_url
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userRes.rows[0];

        if(!user) {
            throw new ExpressError(`theres no user '${username}'`, 404);
        }

        const userJobsRes = await db.query(
            `SELECT j.title, j.company_handle, a.state
                FROM applications AS a
                    JOIN jobs AS j ON j.id = a.job_id
                WHERE a.username = $1`, [username]
        );

        user.jobs = userJobsRes.rows;
        return user;
    }


    static async update(username, data) {
        if(data.password){
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        let { query, value } = partialUpdate("users", data, "username", username);

        const resul = await db.query(query, values);
        const user = result.rows[0];

        if (!user) {
            throw new ExpressError(`there is no user '${username}' `, 404);
        }

        delete user.password;
        delete user.is_admin;

        return result.rows[0];
    }


    static async remove (username) {
        let result = await db.query(
            `DELETE FROM users
                WHERE username = $1
                RETURNING username`, [username]
        );

        if (resul.rows.length === 0) {
            throw new ExpressError(`Theres no user by that name '${username}'`, 404);
        }
    }    
}

module.exports = User;
