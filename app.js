//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const app = express();
const _ = require("lodash");
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to the database
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

//create the db schema
const itemsSchema = {
  name : String
};

//create the model for the db
const Item = mongoose.model("Item", itemsSchema);

//create records in the collection
const item1 = new Item ({
  name: "eat"
});

const item2 = new Item ({
  name: "sleep"
});

const item3 = new Item ({
  name: "play"
});

//create an array of items
const itemArray = [item1, item2, item3]

//custom list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//create new model foir custoim lists
const List = mongoose.model("List",listSchema);

//render home page
app.get("/", function(req, res) {

  Item.find()
  .then(function (foundItems) {
    if (foundItems.length === 0) {
      //insert array into the collection if the array is empty
      Item.insertMany(itemArray)
      .then(() => {
        console.log("Items have been saved successfully in the database");
        })
      .catch((err) => {
        console.log(err);
      });

    };

      res.render("list", {listTitle: "Today", newListItems: foundItems});
      
     })
  .catch((err) => {
      console.log(err);
  });

});

//new item submission
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;
  
  var newItem = new Item ({
    name: itemName
  });
  
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName)
  })}

});



//delete route
app.post("/delete", function(req, res){
// console.log(req.body.check);
var deleteItem = req.body.check;
const listName = req.body.listName;
 
if(listName === "Today"){
 Item.findByIdAndRemove({_id:deleteItem})
.then(
    console.log("record successfully deleted")
)
.catch((err) => {
    console.log(err);
});

  res.redirect("/");
}else{
  List.findOneAndUpdate({name: listName},{$pull:{items: {_id:deleteItem}}})
  .then(function(foundItems){
    res.redirect("/" + listName);
  })
};

}); 




app.get("/:customListName", function(req,res){
  let customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName})
.then(function(foundList) {
  if(!foundList){
    // console.log("List Does Not Exist");
    
    //create a new list
    const list = new List({
    name: customListName,
    items: itemArray
  });
   
  list.save();
  res.redirect("/"+customListName);
  } else {
    //show an existing list
    res.render("list",{listTitle:foundList.name, newListItems:foundList.items})
  }
  
  })
.catch((err) => {
  console.log(err);
});


  

  // res.render("list", {listTitle: listId});
  // console.log(req.params.customListName);
  
  })


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
