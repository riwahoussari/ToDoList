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
async function main() {
    await mongoose.connect('mongodb+srv://admin-riwa:riwa1234@cluster0.tnkueke.mongodb.net/toDoListDB');
}

const lists = [
    {
        name: 'main',
        model: mongoose.model('item', itemSchema)
    }
]

//get requests
app.get('/', function(req, res){
    let model = lists[0].model
    model.find().then((items)=>{
        res.render('list' , {listTitle: 'main', items: items, date: myModule.getDate()})
    })
})
app.get('/:pageName', (req, res)=>{
    let rqName = req.params.pageName
    if(rqName === 'about'){res.render('about')}
    else{
        let list = lists.find((list) => list.name === rqName)
        if(!list){
            list = {
                name: rqName,
                model: mongoose.model(`${rqName}item`, itemSchema)
            }
            lists.push(list)
        }
        list.model.find().then((items)=>{
            res.render('list' , {listTitle: rqName, items: items, date: myModule.getDate()})
        })
    }
})

//post requests
// add list item
app.post('/', function(req, res){
    let listName = req.get('referer').split('/')
    listName = listName[listName.length - 1].split('%20').join(' ')
    if(listName === ''){listName = 'main'}

    let list = lists.find((list) => list.name === listName)
    let rqItem = req.body.newItem
    let newItem = new list.model ({name: rqItem})
    newItem.save().then(()=>{
        res.redirect(`/${listName}`)
    })
})
// delete list item
app.post('/delete', function(req, res){
    let listName = req.get('referer').split('/')
    listName = listName[listName.length - 1].split('%20').join(' ')
    if(listName === ''){listName = 'main'}
    
    let id = req.body.id
    let list = lists.find((list) => list.name === listName)
    list.model.deleteOne({_id: id}).then(()=>{
        res.redirect(`/${listName}`)
    })
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
    console.log('server up and running')
})