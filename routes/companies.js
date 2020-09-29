const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { authRequired, adminRequired } = require('../middleware/auth');
const Company = require('../models/Company');
const { validate } = require('jsonschema');
const { companyNewSchema, companyUpdateSchema } = require('../schemas');

const router = new express.Router();


// get all companies listing

router.get('/', authRequired, async function(req, res,next){
    try {
        const companies = await Company.findAll(req.query);
        return res.json({companies});
    } catch (err) {
        return next(err);
    }
});

// post  create a new company
router.post('/', adminRequired, async function(req, res, next){
    try {
        const validation = validate(req.body, companyNewSchema);
    } catch (err) {
        return next(err);
    }
}); 

// get by handle 
router.post('/', adminRequired, async function(req, res, next){
    try {
        const company = await Company.findOne(req.params.handle);
        return res.json({company});
    } catch (err) {
        return next (err);
    }
});

// patch byt handle
router.patch('/:handle',adminRequired, async function(req, res, next){
    try {
        if('handle' in  req.body){
            throw new ExpressError('no changes based on handles allowed', 400)
        }
        const validation = validate(req.body, companyUpdateSchema);
        if(!validation.valid){
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }
        const company = await Company.update(req.params.handle, req.body);
        return res.json({company});

    } catch (err) {
        return next(err);
        
    }
});

// delete route

router.delete('/:handle', adminRequired, async function(req,res,next){
try {
    await Company.remove(req.params.handle);
    return res.json({message: 'Company deleted'});
} catch (err) {
    return next(err);
}
});


module.exports = router;
