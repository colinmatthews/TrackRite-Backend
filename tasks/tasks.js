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

  .post('/archived', async (req,res) =>{
    try{
      let ancestorKey =  req.body
      console.log(ancestorKey)
      const query = datastore.createQuery('Task').hasAncestor(ancestorKey).filter('archive', '=', true);
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
      const [task] = await datastore.get(key);
      task.key =  task[datastore.KEY]

      let urlSafeKey = await datastore.keyToLegacyUrlSafe(task.key)
      task.urlSafeKey = urlSafeKey[0]
      
      res.send(task)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/urlSafeKey',async (req,res) => {
    try{
      let tid = req.body.tid
      
      let validKey = datastore.keyFromLegacyUrlsafe(tid)
      
      const [task] = await datastore.get(validKey);
      task.key = task[datastore.KEY]

      let urlSafeKey = await datastore.keyToLegacyUrlSafe(task.key)
      task.urlSafeKey = urlSafeKey[0]

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
      const query = datastore.createQuery('Task').hasAncestor(ancestorKey).filter('users', '=', req.user.uid);
      const [tasks] = await datastore.runQuery(query);
      let return_data = []
      
      for (const el of tasks){
        
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

  // Not used, not tested
  /* 
  .post('/batch', async (req,res) =>{
    try{
      let keys = req.body
      const [tasks] = await datastore.get(keys).filter('users', '=', req.user.uid);
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
  */

  .post('/breadcrumbsByKey', async(req,res) => {
    try{
      //Get task by key
      let path = req.body.path //['Team','1234',Project,'12456','Task','124566]
  
      let formatted_path = []
      let keys = []           
      let breadcrumbs = []
      let crumb = {}
      

      // [Team,1234,Project, 12456, Task, 124566]
      path.forEach(el => {
        if (!isNaN(el)){ 
          el = parseInt(el)
        }
        formatted_path.push(el)
      })
     
       //[[Team,1234],[Project, 123456], [Task,124566]]
      for( let i = 0; i < formatted_path.length; i += 2){
        keys.push(formatted_path.slice(i, i + 2))
      }
    
    
      // Builds each key in the path 
      // First iteration will be [Team,1234]
      // Second iteration will be [Team,1234, Project, 12456,]
      // Third iteration will be [Team,1234, Project, 12456, Task, 124566] 
      for( let j = 0; j < keys.length ; j ++){
        let temp = []
        for( let n = 0; n <= j; n ++ ){
          temp.push(keys[n][0])
          temp.push(keys[n][1])
        }

        if(temp.length == 2){ // Team selected
         
        }
        else{
          if(temp.length == 4 ){ // Project selected 
            let project = {}
            project.title = "Home"
            project.key = {path:[1,2,3,4,5,6],id:1234} /* Front end logic uses path length to determine if breadcrumb click fetches task children or project children
                                                      Path of length 4 indicates front end should fetch project children - the content of the path isnt used */
            crumb = {
              key:project.key,
              title:project.title,
              tr:project
            }

          }
          else{
            const taskKey = datastore.key(temp)
            let [task] = await datastore.get(taskKey)

            task.key = task[datastore.KEY]
            let urlSafeKey = await datastore.keyToLegacyUrlSafe(task.key)
            task.urlSafeKey = urlSafeKey[0]

            crumb = {
              key:task.key,
              title:task.title,
              tr:task
            }

          }
         
          breadcrumbs.push(crumb)
        }
      }
      res.send(breadcrumbs)
    
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }

  })

  .post('/', async (req,res) => {
    try{
      //console.log(req.body)

      const task = {
        end_date: req.body.data.end_date,
        start_date: req.body.data.start_date,
        title:req.body.data.title,
        users:req.body.data.users,
        status:req.body.data.status,
        custom_columns:req.body.data.custom_columns,
        details:req.body.data.details,
        owner:req.body.owner,
        archive:false
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

      //console.log(entity)
      await datastore.update(entity);
      res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .put('/batch',async (req,res)=>{
    try{
      
      let tasks = req.body
      let entities = []

      tasks.forEach(task => {
        let formatted_path = [] // Parse string of project or task number 
        let path = task.key.path
        path.forEach(el => {
          if (!isNaN(el)){ // if element is a number
            el = parseInt(el)
          }
          formatted_path.push(el)
        })

        let key = datastore.key(formatted_path)
        delete task['key']
        const entity = {key: key, data:task}


        entities.push(entity)
      })
      
      await datastore.update(entities);
      res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .delete('/batch', async(req,res) => {
    try{
      let tasks = req.body.tasks
      let entities = []

      tasks.forEach(async task => {
        let formatted_path = [] // Parse string of project or task number 
        let path = task.key.path
        path.forEach(el => {
          if (!isNaN(el)){ // if element is a number
            el = parseInt(el)
          }
          formatted_path.push(el)
        })
        let key = datastore.key(formatted_path)

        const query = datastore.createQuery('Task').hasAncestor(key)
        const [childTasks] = await datastore.runQuery(query);
        childTasks.forEach(async el => {
          let key = el[datastore.KEY]
          await datastore.delete(key);
        })
        
      })
    
    res.sendStatus(200)
  }
  catch(err){
    console.log(err)
    res.status(500).send('Internal server error')
  }
})
  
 

module.exports = router;