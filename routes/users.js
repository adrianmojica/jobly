const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { ensureCorrectUser, authRequired } = require('../middleware/auth');
const User = require('../models/User');
const { validate } = require('jsonschema');
const { userNewSchema, userUpdateSchema } = require('../schemas');
const createToken = require('../helpers/createToken');

const router = express.Router();

// get all users
router.get('/', authRequired, async function(req, res, next){
    try {
        const users = await User.findAll();
        return res.json({users});
    } catch (err) {
        return next(err);
    }
});

//get user by username
router.get('/:username', authRequired, async function(req,res, next){
    try {
        const user = await User.findOne(req.params.username);
    } catch (err) {
        return next(err);
    }
})

//post userdata
router.post('/', async function (req, res, next){
    try {
      const validation = validate(req.body, userNewSchema);
    
      if(!valudation.valid){
          throw new ExpressError(validation.error.map(e => e.stack), 400);
      }

      const newUser = await User.register(req.body);
      const token = createToken(newUser);
      return res.status(201).json({token});
    
    } catch (error) {
        return next(error);
    }
});


//patch
router.patch('/:username', ensureCorrectUser, async function (req, res, next){
    try {
        if ('username' in req.body || 'is_admin' in req.body) {
            throw new ExpressError('you are not allowed to change this user', 400);
        }
        const validation = validate(req.body, userUpdateSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({user});
    } catch (error) {
        return next(error);
    }
});

//delete

router.delete('/:username', ensureCorrectUser, async function(req, res, next){
    try {
        await User.remove(req.params.username);
        return res.json({message: 'user deleted'});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;