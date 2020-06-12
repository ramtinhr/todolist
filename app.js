//jshint esversion:6 

const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js')
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded(

    { extended : true }

));


mongoose.connect("mongodb+srv://ramtinhr:rh2567596@cluster0-izgpk.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
        name : String
};

const Item = mongoose.model("Item",itemsSchema);

const coding = new Item(
    {
        name :"coding"
    }
);

const exercise = new Item(
    {
        name : "exercise"
    }
);

const rest = new Item (
    {
        name : "rest"
    }
);

const defaultItems = [coding,exercise,rest];

const listSchema = {
    name : String,
    items : [itemsSchema]
}

const List = mongoose.model("List" , listSchema);

app.set('view engine', 'ejs');



app.get('/',(req,res)=> {


    let day = date.getDay();
    Item.find({},(err,items)=> {
        if(err) {
            console.log(err);
        }else {
            if(items.length === 0 ) {
                
                Item.insertMany(defaultItems,(err) => {
                    err ? console.log(err) : console.log("Items stored default successfully");
                });
                
            } else {
                res.render("list",{ listTitle : day , newListItems : items });
            }
            
        }
    })

    
    // res.sendFile(__dirname + '/index.html');

});

app.get('/:customListName',(req,res) => {

    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name : customListName },(err,foundList) => {
        if(err) {
            console.log(err);
        }else {
            if(!foundList) {
                    
                const list = new List(
                    {
                        name : customListName,
                        items : defaultItems
                    }
                );
                list.save();
                res.redirect(`/${customListName}`);
            } else {
                res.render("list",{listTitle : foundList.name , newListItems : foundList.items});
            }
        }
    })
    
})

app.post('/',(req,res) => {
    const itemName =  req.body.newItem;
    const listName = req.body.submit;
    const item = new Item(
        {
            name : itemName
        }
    );
    if(listName === date.getDay()) {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name : listName} , (err,foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${listName}`);
        })
    }  
   
    
});

app.post('/delete',(req,res) => {
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;
    if(listName === date.getDay()) {
        Item.findByIdAndRemove(checkedItemId,(err) => {
            err ? console.log(err) : res.redirect("/");
        });
        
    } else {
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}},(err , foundList) => {
            if(!err) {
                res.redirect(`/${listName}`);
            }   
        })
    }

   
});



app.listen(3000,()=>console.log('server is runnig on port 3000'));