const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .get('/allKeys',async (req,res) => {
    try{
      const query = datastore.createQuery('Task').filter('users', '=', req.user.uid).select('__key__')
      const [tasks] = await datastore.runQuery(query);
      tasks.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(tasks)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })


  .get('/all',async (req,res) => {
    try{
      const query = datastore.createQuery('Task').filter('users', '=', req.user.uid)
      const [tasks] = await datastore.runQuery(query);
      tasks.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(tasks)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })
  // By query parameter key
  .post('/key', async (req,res) =>{
    try{
      let key =  req.body
      const [task] = await datastore.get(key).filter('users', '=', req.user.uid);
      task.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(task)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  // By query parameter key
  .post('/childrenKeys',async (req,res) => {
    try{
      let ancestorKeys =  req.body
      const query = datastore.createQuery('Task').hasAncestor(ancestorKey).filter('users', '=', req.user.uid).select('__key__')
      const [tasks] = await datastore.runQuery(query);
      res.send(tasks)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  // By query parameter key
  .post('/children',async (req,res) => {
    try{
      let ancestorKey =  req.body
      console.log(ancestorKey)
      const query = datastore.createQuery('Task').hasAncestor(ancestorKey).filter('users', '=', req.user.uid);
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
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  // By query parameter key
  .post('/allChildren',async (req,res) => {
    try{
      let ancestorKeys =  req.body
      let returnTasks = []
      ancestorKeys.forEach(async (key) => {
        const query = datastore.createQuery('Task').hasAncestor(key).filter('users', '=', req.user.uid);
        const [tasks] = await datastore.runQuery(query);
        tasks.forEach(el => {
          el.key = el[datastore.KEY]
        })
        returnTasks.push(tasks)
      })
      res.send(returnTasks)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/batch', async (req,res) =>{
    try{
      let keys = req.body
      const [task] = await datastore.get(keys).filter('users', '=', req.user.uid);
      tasks.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(tasks)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/', async (req,res) => {
    try{
      console.log(req.body)

      const task = {
        end_date: req.body.data.end_date,
        start_date: req.body.data.start_date,
        title:req.body.data.title,
        users:req.body.data.users,
        status:req.body.data.status,
        custom_columns:req.body.data.custom_columns,
        details:req.body.data.details,
        owner:req.body.owner,
      }

      let path = req.body.key.path

      let formatted_path = [] // Parse string of project or task number 
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })
     

      formatted_path.push('Task')
      let key = datastore.key(formatted_path)
      const entity = {key: key, data: task}

      let data = await datastore.upsert(entity)
      res.send(data)

    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .put('/',async (req,res)=>{
    try{

      let path = req.body.key.path
      let task = req.body

      let formatted_path = [] // Parse string of project or task number 
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })

      let key = datastore.key(formatted_path)
      delete task['key']

      const entity = {key: key, data:task}

      console.log(entity)
      await datastore.update(entity);
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

module.exports = router;