const mongoose = require("mongoose");

//database connection
// mongoose.connect("mongodb://localhost:3000/Chat-App")
mongoose.connect("mongodb+srv://friendchat:friendchat@cluster0.rn3tr.mongodb.net/test" 
).then(()=>{
    console.log("Connection Sucessfully");
}).catch(()=>{
    console.log("No connection");
})


