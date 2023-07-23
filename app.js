import express from 'express';
const app = express();
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static('public'))
import myModule from './myModule.cjs';
import mongoose from 'mongoose';

main('').catch(err => console.log(err));

const itemSchema = new mongoose.Schema({
    name: String
})
// const Item = mongoose.model('item', itemSchema)
// const WorkItem = mongoose.model('workItem', itemSchema)

const lists = [
    {
        name: 'main',
        model: mongoose.model('item', itemSchema)
    }
]
async function main(func, listName, id) {
    await mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB');

    if(func === 'get'){
        let model;
        let found = false;
        lists.forEach((list)=>{
            if(list.name === listName){
                model = list.model
                found = true;
            }
        })
        if(!found){
            lists.push({
                name: listName,
                model: mongoose.model(`${listName}item`, itemSchema)
            })
            model = lists[lists.length - 1].model
        }
        return await model.find()
    }
    if(func === 'dl'){
        let model;
        lists.forEach((list)=>{
            if(list.name === listName){
                model = list.model
            }
        })
        await model.deleteOne({_id: id})
    }
}

//get requests
app.get('/', function(req, res){
    let items = main("get" ,"main")
    items.then(function(result) {
        res.render('list' , {listTitle: 'main', items: result, date: myModule.getDate()})
    })
    
})
app.get('/about', function(req, res){
    res.render('about')
})
app.get('/:pageName', function(req, res){
    let pageName = req.params.pageName
    if(pageName !== 'about'){
        let items = main("get", pageName)
        items.then(function(result) {
            res.render('list' , {listTitle: pageName, items: result, date: myModule.getDate()})
        })
    }
})

//post requests
app.post('/', function(req, res){
    let listName = req.body.list
    let newItem = req.body.newItem
    let Model
    lists.forEach((list)=>{
        if(list.name === listName){
            Model = list.model
        }
    })
    let item = new Model ({
        name: newItem
    })
    item.save()
    res.redirect(`/${listName}`)
})

app.post('/delete', function(req, res){
    let id = req.body.id
    let list = req.body.list
    main('dl', list, id)
    res.redirect(`/${list}`)
})

app.post('/new', function(req, res){
    let listName = req.body.newList;
    res.redirect(`/${listName}`)
})
//////////
app.listen(3000, function(){
    console.log('server up and running on port 3000')
})