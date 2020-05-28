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
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/private', async (req,res) =>{
    try{
      console.log(req.user.uid)
      const query = datastore.createQuery('Project').filter('private', '=', true).filter('users', '=', req.user.uid)
      const [projects] = await datastore.runQuery(query);
      projects.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(projects)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/publicKeys', async (req,res) =>{
    try{
      const query = datastore.createQuery('Project').filter('private', '=', false).filter('users', '=', req.user.uid).select('__key__')

      const [projects] = await datastore.runQuery(query);
      let keys = []
      projects.forEach(el => {
        keys.push(el[datastore.KEY])
      })
      res.send(keys)
    }
    catch(err){
      console.log(err)
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
      console.log(err)
      res.status(500).send('Internal server error')
    }
    
  })

  // By query parameter key
  .get('/childrenKeys', async (req,res) => {
    try{
      let ancestorKey =  req.params.key
      const query = datastore.createQuery('Project').hasAncestor(ancestorKey).filter('users', '=', req.user.uid).select('__key__')

      const [projects] = await datastore.runQuery(query);
      const keys = projects.map(el => el[datastore.KEY])
      res.send(keys)
    }
    catch(err){
      console.log(err)
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
      console.log(err)
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
      
      for(el of tasks){
        
        let temp = {}
        if(el[datastore.KEY].path.length == ancestorKey.path.length + 2){  // is a direct child as key is two (entity type, value) elements longer than parent key
          temp = el
          temp.key = el[datastore.KEY]

          let urlSafeKey = await datastore.keyToLegacyUrlSafe(temp.key)
          temp.urlSafeKey = urlSafeKey[0]

          return_data.push(temp)
        } 
      }

      res.send(return_data)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/', async (req,res) => {
    try{

      const project = [
        {
          name:'thumbnail',
          value:req.body.project.thumbnail,
          excludeFromIndexes:true
        },
        {
          name:"description",
          value:req.body.project.description,
        },
        {
          name:"end_date",
          value:req.body.project.end_date,
        },
        {
          name:"start_date",
          value:req.body.project.start_date,
        },
        {
          name:"private",
          value:req.body.project.private,
        },
        {
          name:"owners",
          value:req.body.project.owners,
        },
        {
          name:"users",
          value:req.body.project.users
        },
        {
          name:"title",
          value:req.body.project.title
        },
        {
          name:"guests",
          value:req.body.project.guests
        }
      ]

      const path = req.body.team.key.path

      let formatted_path = [] // Parse string of project or task number 
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })
     

      formatted_path.push('Project')
      const key = datastore.key(formatted_path)

      const entity = {key: key, data: project}

      await datastore.upsert(entity)
      res.status(200)

    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .put('/', async (req,res) => {
    try{
      let path = req.body.key.path
      const project = [
        {
          name:'thumbnail',
          value:req.body.thumbnail,
          excludeFromIndexes:true
        },
        {
          name:"description",
          value:req.body.description,
        },
        {
          name:"end_date",
          value:req.body.end_date,
        },
        {
          name:"start_date",
          value:req.body.start_date,
        },
        {
          name:"private",
          value:req.body.private,
        },
        {
          name:"owners",
          value:req.body.owners,
        },
        {
          name:"users",
          value:req.body.users
        },
        {
          name:"title",
          value:req.body.title
        }
      ]

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

      await datastore.update(entity);
      res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .delete('/', async(req,res) => {
    try{
      let project = req.body.project
     

      let formatted_path = [] // Parse string of project or task number 
      let path = project.key.path
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })
      let key = datastore.key(formatted_path)
      project.key.path = formatted_path

      const query = datastore.createQuery('Task').hasAncestor(key)
      const [childTasks] = await datastore.runQuery(query);
      childTasks.forEach(async el => {
        let key = el[datastore.KEY]
        await datastore.delete(key);
      })

      await datastore.delete(project.key)

    res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })
  
  

module.exports = router;