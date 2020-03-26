const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .get('/', async (req,res) =>{
    try{
      const query = datastore.createQuery('User').order('displayName')
      const [users] = await datastore.runQuery(query);
      users.forEach(el => {
        el.key = el[datastore.KEY]
      })
      //console.log(users)
      res.send(users)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/uid', async (req,res) =>{
    try{
      let uid = req.user.uid
      //console.log(uid)
      const query = datastore.createQuery('User').filter('uid','=',uid)
      const [users] = await datastore.runQuery(query);
      users.forEach(el => {
        el.key = el[datastore.KEY]
      })
      //console.log(users)
      res.send(users)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/', async (req,res) =>{
    try{
      
      const key = datastore.key('User')
      const entity = {key:key, data:req.body}

      await datastore.upsert(entity)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .put('/', async (req,res) =>{
   
      try{
        //console.log(req.body)
        let path = req.body.key.path
        let user = req.body.data

        //console.log(req.body)

        let formatted_path = [] // Parse string of project or task number 
        path.forEach(el => {
          if (!isNaN(el)){ // if element is a number
            el = parseInt(el)
          }
          formatted_path.push(el)
        })

        user.uid = req.user.uid

        let key = datastore.key(formatted_path)
        let entity = {
          key:key,
          data:user
        }

        await datastore.update(entity)
        res.send(200)
      }
      catch(err){
        //console.log(err)
        res.status(500).send('Internal server error')
      }
    })



module.exports = router;