const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

var express = require('express'),
router = express.Router();



router
  .post('/pie', async (req,res) => {

    try{
      let ancestorKey =  req.body;

      const query = datastore.createQuery('Task').hasAncestor(ancestorKey);
      const [tasks] = await datastore.runQuery(query);
      let taskStatus = tasks.map(el => el.status)
     
      let returnData = {}
      let counter = 0

      // Count duplicates of status values for children
      taskStatus.forEach(el => {
        if(el in returnData){
          counter = returnData[el]
        }
        else{
          counter = 0
        }
        counter ++;
        returnData[el] = counter
      })


      res.send(returnData)
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }


  })
  .post('/bar', async (req,res) => {

    try{
      let children =  req.body.children;
      //console.log(children)
      let date = new Date(req.body.date)
      

      for(let i = 0; i < children.length; i ++){
        const query = datastore.createQuery('Task').hasAncestor(children[i].key).filter('end_date','>', date);
        const [tasks] = await datastore.runQuery(query);
       
        children[i].overdue = tasks.length
        
        //console.log(temp)
      }
      console.log(children)

      let return_data = []
      for( var n = 0; n < children.length; n ++){
        return_data.push({title:children[n].title,overdue:children[n].overdue})
      }
      
      res.send(return_data)
      /*console.log(children)console.log(children)
     
     
      
      let counter = 0

      // Count duplicates of status values for children
      taskStatus.forEach(el => {
        if(el in returnData){
          counter = returnData[el]
        }
        else{
          counter = 0
        }
        counter ++;
        returnData[el] = counter
      })
      */

      
    }
    catch(err){
      console.log(err)
      res.status(500).send('Internal server error')
    }


  })

module.exports = router;