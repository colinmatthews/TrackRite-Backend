const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .get('/privateKeys', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('users', '=', req.user.uid).select('__key__')
      const [projects] = await datastore.runQuery(query);
      let keys = []
      projects.forEach(el => {
        keys.push(el[datastore.KEY])
      })
      res.send(keys)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/private', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('users', '=', req.user.uid)
      const [projects] = await datastore.runQuery(query);
      projects.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(projects)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/publicKeys', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('private', '=', false).select('__key__')

      const [projects] = await datastore.runQuery(query);
      let keys = []
      projects.forEach(el => {
        keys.push(el[datastore.KEY])
      })
      res.send(keys)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
    
  })

  .get('/public', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('private', '=', false)
      const [projects] = await datastore.runQuery(query);
      projects.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(projects)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
    
  })

  // By query parameter key
  .get('/childrenKeys', async (req,res) => {
    try{
      let ancestorKey =  req.params.key
      const query = datastore.createQuery('Project').hasAncestor(ancestorKey).select('__key__')

      const [projects] = await datastore.runQuery(query);
      const keys = projects.map(el => el[datastore.KEY])
      res.send(keys)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/numericID', async(req,res) => {
    try{
      let numericID = req.body
      const [project] = await datastore.createQuery('Project').filter('__key__','=',datastore.key(['Project', numericID]));
      res.send(project)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })


  // By query parameter key
  .post('/children', async (req,res) => {
    try{
      let ancestorKey =  req.body;
      const query = datastore.createQuery('Task').hasAncestor(ancestorKey);
      const [tasks] = await datastore.runQuery(query);
      let return_data = []
      
      tasks.forEach(el => {
        
        let temp = {}
        if(el[datastore.KEY].path.length == ancestorKey.path.length + 2){  // is a direct child as key is two (entity type, value) elements longer than parent key
          temp = el
          temp.key = el[datastore.KEY]

          return_data.push(temp)
        } 
      })

      res.send(return_data)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/', async (req,res) => {
    try{
      const project = {
        private: req.body.private,
        start_date: req.body.start_date,
        title:req.body.title,
        users:req.body.users
      }
      const key = datastore.key(req.body.key)
      const entity = {key: key, data: project}

      await datastore.upsert(entity)

    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .put('/', async (req,res) => {
    try{
      let path = req.body.key.path
      let project = req.body

      let formatted_path = [] // Parse string of project or task number 
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })

      let key = datastore.key(formatted_path)
      delete project['key']

      const entity = {key: key, data:project}

      //console.log(entity)
      await datastore.update(entity);
      res.sendStatus(200)
    }
    catch(err){
      //console.log(err)
      res.status(500).send('Internal server error')
    }
  })

module.exports = router;