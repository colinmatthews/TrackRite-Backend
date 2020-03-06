const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .get('/private', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('users', '=', req.user.uid)
      const [projects] = await datastore.runQuery(query);
      res.send(projects)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })


module.exports = router;