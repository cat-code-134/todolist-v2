//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-catherine:test123@cluster0.hpyfy.mongodb.net/choresDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const fItem = new Item ({
  name: "Welcome to your ToDo List"
});

const sItem = new Item ({
  name: "=Hit the + icon to add an item"
});

const tItem = new Item ({
  name: "<--- Hit this to delete an item"
});

const defaultItems = [fItem, sItem, tItem];

const listSchema = ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}).then(function(foundItems){
     
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems).then(function() {

        console.log("Items successfully added to database.");

      }).catch(function(err){
        console.log(err);
      });

      res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(err){
      console.log(err);
  });


   



  //mongoose.connection.close();

});


app.get("/:customListName", function(req, res){

  const requestedList = _.capitalize(req.params.customListName);

  List.findOne({ name: requestedList }).then(function(foundList){
    if(!foundList){
      const list = new List ({
        name: requestedList,
        items: defaultItems
      });
    
      list.save();

      res.redirect ("/" + requestedList);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    
  }).catch(function(err) {
    console.log(err);
  })
  
  

})    
  




app.post("/", function(req,res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
      
    })
  }

  

}); 


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {  
    Item.findByIdAndDelete(checkedItemId).then(function(){

      console.log("Successfully deleted item from database");
      res.redirect("/");
  
    }).catch(function(err){
      console.log(err);
    });

  } else {

    List.findOneAndUpdate (
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    ).then(function(){
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
      
    })

  }




  

  
});



// app.post("/", function(req, res){

//   const item = req.body.newItem;

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
