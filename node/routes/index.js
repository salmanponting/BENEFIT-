const axios = require('axios');
const _ = require('lodash');
let restAPIURL = 'https://salmansimula.atlassian.net/rest/api/2';
let restAPIURLForBeneFits = 'https://salmansimula.atlassian.net/rest/agile/1.0/issue/';
var config = {
  method: 'get',
  url: 'https://salmansimula.atlassian.net/rest/api/2/field?project=10000',
  headers: { 
    'Authorization': 'Basic c2FsbWFuMTk5NDFAbGl2ZS5jb206NGFWM0p5TFFqTWplWnhDdHRGeDZGNzRC', 
    'Cookie': 'atlassian.xsrf.token=04d8ca42-435a-4619-9c3b-535575d51403_927facdb802badca3e2f1ad9bef973a92b0f7555_lin'
  }
};
export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', async (req, res) => {

        await getKeyofBenefits();
        res.redirect('/atlassian-connect.json');
    });


























    let data = {};
    // app.get('/get-task', (req, res) => {
    //   config.url= restAPIURL+ '/search?jql=project%3D'+10000+'&maxResults=1000';
    //   res.render(
    //     'hello-world.hbs', 
    //     {
    //       title: 'Atlassian Connect',
    //       data:data
    //     }
    //   );        
    // });

    
    app.get('/get-epics', (req, res) => {
      
      config.url= restAPIURL+ '/project';
        axios(config)
      .then(async (response) => {
        data = response.data;
       let finalData = await projects(data,0,[]); 
        
       res.render(
            'epics.hbs', 
            {
              title: 'Atlassian Connect',
              data:data,
              projData:finalData
            }
          );
        
})
.catch((error) => {
  console.log(error);
});

});

    
}

const projects = async (data,index,finalData)=>{
  
  let x = data[index];
    let key = x.key;
    let projname = x.name;
    let benefitKey = await getKeyofBenefits(x.id);
    
    let issue= await getData(key);

    if(issue)
    {
      let taskDetails= await getBeneFits(issue.issues,benefitKey,0,[]);
      console.log("task Detail",taskDetails);
      let data2 = {
        projectID:key,
        projName:projname,
        task: taskDetails
      }
      finalData.push(data2);
      if(index==data.length-1){
        return finalData;
      }
      else{
        index= index+1;
        return projects(data,index,finalData);
      }
    }

    
  
}


const getData = (projectID)=>{
  return new Promise((resolve, reject) => {
    config.url= restAPIURL+ '/search?jql=project%3D'+projectID+'&maxResults=1000';
    axios(config)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      console.log(error);
      resolve(null);
    });
	});
}

const getBeneFits =async (issues,benefitKey,index,dataToReturn)=>{
  
  let x= issues[index];
      let benefit = await getBeneFitsOfATask(x.key,benefitKey);
      if(benefit)
      {
           let data = {
            summary:x.fields.summary,
            benefits:benefit
          }
          dataToReturn.push(data);
      }
      else{
        let data = {
          summary:x.fields.summary,
          benefits:0
        }
        dataToReturn.push(data);
      }
      if(index==issues.length-1)
      return dataToReturn;
      else
      {
        index=index+1;
        return getBeneFits(issues,benefitKey,index,dataToReturn);
      }
      


	

}

const getBeneFitsOfATask = (issueKey,benefitKey)=>{
  return new Promise((resolve, reject) => {
      config.url= restAPIURLForBeneFits+issueKey+'?fields='+benefitKey;
      console.log(config.url);
      axios(config)
    .then((response) => {
      console.log(response.data);
      if(Object.keys(response.data,'fields'))
         resolve(response.data.fields[benefitKey]);
    })
    .catch((error) => {
      console.log(error);
      resolve(null);
    });
    })	
}

const getKeyofBenefits = (projectID)=>{
  return new Promise((resolve, reject) => {
      config.url= 'https://salmansimula.atlassian.net/rest/api/3/field';
      axios(config)
    .then((response) => {
      //console.log(response.data);
         let arr = response.data;
                 
         var obj = _.map(arr, function(o) {
           
          if (o.name == "Benefit points")
          {
            console.log("benefit key",o);
            resolve(o.id);
          }
          
      });
         
    })
    .catch((error) => {
      console.log(error);
      resolve(null);
    });
    })	
}