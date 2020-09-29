const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { adminRequired, authRequired } = require('../middleware/auth');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const { jobNewSchema, jobUpdateSchema } = require('../schemas');

const router = express.Router({ mergeParams: true });


// get jobs
router.get('/', authRequired, async function(req, res, next){
    try {
        const jobs = await Job.findAll(req.query);
        return res.json({jobs});

    } catch (error) {
        return next(error);
    }
});

// get one job
router.get('/:id', authRequired, async function(req, res, next){
    try {
        const job = await Job.findOne(req.params.id);
        return res.json({job});
    } catch (error) {
        return next(error);
    }
});

//post one job
router.post('/', authRequired, async function(req, res, next){
    try {
        const validation = validate(req.body, jobNewSchema);
        if(!validation.valid){
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    } catch (error) {
        return next(err);
    }
});


//patch one job
router.patch('/:id', authRequired, async function(req, res, next){
    try {
        if('id' in req.body){
            throw new ExpressError('You are not allowed to change ID', 400);
        }
        const validation = va;IDBDatabase(req.body, jobUpdateSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.error.map(e => e.stack), 400);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({job});
    } catch (error) {
        return next(error);
    }
});


// delete one job
router.delete('/:id', authRequired, async function(req, res, next){
    try {
        await Job.remove(req.param.id);
        return res.json({message: 'Job deleted'})
    } catch (error) {
        return next(error);
    }
});

// apply 
router.post('/:id/apply', authRequired, async function(req, res, next){
    try {
        const state = req.body.state || 'applied';
        await Job.apply(req.params.id, res.locals.username, state);
        return res.json({message: state});
    } catch (error) {
        return next(error);
    }
});


module.exports = router;
