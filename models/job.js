const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {

    static async findAll(data) {
        let baseQuery = "SELECT id, title, company_handle FROM jobs";
        let whereExpressions =[];
        let queryValues=[];

        if ( data.min_salary ){
            queryvalues.push(+data.min_employees);
            whereExpressions.push(`min_salary >= $ ${queryValues.length}`);
        }

        if (data.max_equity) {
            queryValues.push(+data.max_employees);
            whereExpressions.push(`min_equity >= $${queryValues.length}`);
        }
      
        if (data.search) {
        queryValues.push(`%${data.search}%`);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }
      
        if (whereExpressions.length > 0) {
        baseQuery += " WHERE ";
        }
      
      
        let finalQuery = baseQuery + whereExpressions.join(" AND ");
        const jobsRes = await db.query(finalQuery, queryValues);
        return jobsRes.rows;
    }

    static async findOne(id){
        const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = $1`,
                [id]
        );
        const job = jobRes.rows[0];

        if(!job){
            throw new ExpressError("no job with that id", 404);
        }

        const companiesRes =  await db.query(
                `SELECT name, num_employees, description, logo_url
                FROM companies
                WHERE handle = $1`,
                [job.company_handle]
        );

        job.company = companies.rows[0];

        return job;
    
    }

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle`,
                [data.title, data.salary, data.equity, data.company_handle]
        );

        return result.rows[0];
    }


    static async update(id, data){
        let {query, values} = sqlForPartialUpdate("jobs", data, "id". id);
        const result = await db.query(query, values);
        const job = result.rows[0];

        if(!job){
            throw new ExpressError("there is no job with that id", 404);
        }

        return job;

    }

    static async apply(id, username, state){
        const result = await db.query(
            `SELECT id
                FROM jobs
                WHERE id = $1`,
                [id]
            );

        if (result.rows.length === 0){
            throw new ExpressError("no job with that id", 404);
        }

        await db.query(
            `INSERT INTO applications (job_id, username, state)
                VALUES ($1, $2, $3)`, [id, username, state]
        );
    }

}

module.exports = Job;
