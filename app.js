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

const lists = [
    {
        name: 'main',
        model: mongoose.model('item', itemSchema)
    }
]
async function main(func, listName, id) {
    await mongoose.connect('mongodb+srv://admin-riwa:riwa1234@cluster0.tnkueke.mongodb.net/toDoListDB');

    if(func === 'get'){
        let model;
        lists.forEach((list)=>{
            if(list.name === listName){model = list.model}
        })
        if(!model){
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
// add list item
app.post('/', function(req, res){
    let referer = req.get('referer').split('/')
    referer = referer[referer.length - 1]
    console.log(referer)
    if(referer === ''){
        referer = 'main'
    }else{
        referer = referer.replaceAll('%20', ' ')
    }
    console.log(referer)
    let newItem = req.body.newItem
    lists.forEach((list)=>{
        if(list.name === referer){
            let item = new list.model ({name: newItem})
            item.save()
        }
    })
    res.redirect(`/${referer}`)
    // res.redirect('/main')
})
// delete list item
app.post('/delete', function(req, res){
    let id = req.body.id
    let referer = req.get('referer').split('/')
    referer = referer[referer.length - 1]
    console.log(referer)
    if(referer === ''){
        referer = 'main'
    }
    console.log(referer)
    // referer = referer[referer.length - 1].replaceAll('%20' , ' ')
    // if(!referer){referer = 'main'}
    main('dl', referer, id)
    res.redirect(`/${referer}`)
})
// navigate lists
app.post('/nav', function(req, res){
    let newListName = req.body.newList;
    if(newListName !== 'about'){
        res.redirect(`/${newListName}`)
    }else{
        res.redirect(req.get('referer'));
    }
})
//////////
app.listen(process.env.PORT || 3000, function(){
    console.log('server up and running on port 3000')
})