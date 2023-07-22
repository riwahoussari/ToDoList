//express
import express from 'express';
const app = express();
//body parser
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({extended: true}))
//ejs
app.set('view engine', 'ejs')
//static files
app.use(express.static('public'))
//my module
import myModule from './myModule.cjs';

//app
let items = ['item 1', 'item 2'];
let workItems = ['work 1']

//get requests
app.get('/', function(req, res){
    res.render('list' , {listTitle: myModule.getDay(), items: items})
})
app.get('/work', function(req, res){
    res.render('list' , {listTitle: 'work', items: workItems})
})
app.get('/about', function(req, res){
    res.render('about')
})

//post requests
app.post('/', function(req, res){
    let list = req.body.list
    let newItem = req.body.newItem
    if(list === 'work'){
        if(newItem){
            workItems.push(newItem)
        }
        res.redirect('work')
    }else{
        if(newItem){
            items.push(newItem)
        }
        res.redirect('/')
    }
})

//////////
app.listen(3000, function(){
    console.log('server up and running on port 3000')
})