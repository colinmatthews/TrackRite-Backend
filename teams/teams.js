const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .get('/', async (req,res) =>{
    try{
      const query = datastore.createQuery('Team').filter('users', '=', req.user.uid).filter('archive','=',false)
      const [teams] = await datastore.runQuery(query);
      teams.forEach(el => {
        el.key = el[datastore.KEY]
      })
      res.send(teams)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/children', async (req,res) =>{ // is batch request
    try{
      let teams = req.body
      let returnData = []

      for(team of teams){
        let ancestorKey = team.key
        const query = datastore.createQuery('Project').hasAncestor(ancestorKey);
        const [projects] = await datastore.runQuery(query);
        console.log(team)
      
        projects.forEach(el => {
          el.key = el[datastore.KEY]
          el.team = {
            title:team.title,
            key:team.key
          }
  
          if(el.private == true && el.users.includes(req.user.uid)){  // Private project that requesting users is assigned to
            returnData.push(el)
          } 

          else if(el.private == false){ // Public projects
            returnData.push(el)
          }
        })
      }

      res.send(returnData)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .get('/archive', async (req,res) =>{
    try{
      const query = datastore.createQuery('Team').filter('users', '=', req.user.uid).filter('archive','=',true)
      const [teams] = await datastore.runQuery(query);
      res.send(teams)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })

  .post('/', async (req,res) =>{
    try{
    const team = [
      {
        name:'users',
        value:req.body.users,
      },
      {
        name:"title",
        value:req.body.title,
      },
      {
        name:"archive",
        value:false,
      },
    ]
    const key = datastore.key('Team')
    const entity = {key: key, data: team}

    await datastore.upsert(entity)
    res.status(200)

  }
  catch(err){
    console.log(err)
    res.status(500).send('Internal server error')
  }
  })

  .put('/', async (req,res) =>{
    try{
      let path = req.body.key.path
      const team = [
        {
          name:'users',
          value:req.body.users,
        },
        {
          name:"title",
          value:req.body.title,
        },
        {
          name:"archive",
          value:req.body.archive,
        },
      ]

      let formatted_path = [] // Parse string of project or task number 
      path.forEach(el => {
        if (!isNaN(el)){ // if element is a number
          el = parseInt(el)
        }
        formatted_path.push(el)
      })

      let key = datastore.key(formatted_path)
      delete team['key']

      const entity = {key: key, data:team}

      console.log(entity)
      await datastore.update(entity);
      res.sendStatus(200)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }
  })


module.exports = router;