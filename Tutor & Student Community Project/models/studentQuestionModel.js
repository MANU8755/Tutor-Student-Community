const mongoose  = require("mongoose");

//student question Schmea in which student has to follow the schema rules while posting a questions
let studentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
      },  
      description: {
        type: String,
        required: true
      },
      studentUserName:{
        type:String,
        required:true
      }
},{timestamps:true})

let studentQuestionModel = mongoose.model("studentQuestions",studentSchema);

module.exports = studentQuestionModel;