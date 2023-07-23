import express from 'express';
const app = express();
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static('public'))
import myModule from './myModule.cjs';
import mongoose from 'mongoose';
import camelcase from 'camelcase';

main('').catch(err => console.log(err));

const itemSchema = new mongoose.Schema({
    name: String
})

const lists = [
    {
        name: 'main',
        camelName: 'main',
        model: mongoose.model('item', itemSchema)
    }
]
let listTitle;
async function main(func, listName, id) {
    await mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB');

    if(func === 'get'){
        let model;
        let found = false;
        lists.forEach((list)=>{
            if(list.camelName === camelcase(listName)){
                model = list.model
                found = true;
                listTitle = list.name;
            }
        })
        if(!found){
            lists.push({
                name: listName,
                camelName: camelcase(listName),
                model: mongoose.model(`${camelcase(listName)}item`, itemSchema)
            })
            model = lists[lists.length - 1].model
            listTitle = listName
        }
        return await model.find()
    }
    if(func === 'dl'){
        let model;
        lists.forEach((list)=>{
            if(list.camelName === listName){
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
        res.render('list' , {listTitle: 'main', camelName: 'main', items: result, date: myModule.getDate()})
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
            res.render('list' , {listTitle: listTitle, camelName: camelcase(pageName), items: result, date: myModule.getDate()})
        })
    }
})

//post requests
app.post('/', function(req, res){
    let camelListName = req.body.list
    let newItem = req.body.newItem
    let Model
    lists.forEach((list)=>{
        if(list.camelName === camelListName){
            Model = list.model
        }
    })
    let item = new Model ({
        name: newItem
    })
    item.save()
    res.redirect(`/${camelListName}`)
})

app.post('/delete', function(req, res){
    let id = req.body.id
    let camelListName = req.body.list
    main('dl', camelListName, id)
    let listName;
    lists.forEach((list)=>{
        if(list.camelName === camelListName){
            listName = list.name
        }
    })
    res.redirect(`/${listName}`)
})

app.post('/new', function(req, res){
    let newListName = req.body.newList;
    if(newListName !== 'about'){
        res.redirect(`/${newListName}`)
    }else{
        res.redirect(req.get('referer'));
    }
})
//////////
app.listen(3000, function(){
    console.log('server up and running on port 3000')
})