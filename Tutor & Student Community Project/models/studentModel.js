const { default: mongoose } = require("mongoose");

//Student Schema
let StudentSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minLength:5,
        maxLength:30
    },
    userName:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        minLength:5,
        maxLength:30
    },
    age:{
        type:Number,
        required:true,
        min:14,
        max:35,
    },
    StudyingClass:{
        type:Number,
        // required:true,
        min:1,
        max:12,
    },
    subjects:{
        type:[String],
        required:true,
    },
    phoneNumber:{
        type:Number,
        required:true,
        min:10,
    },
    email:{
        type:String,
        required:true,
        minLength:6,
        maxLength:40,
        unique:true,
        validate:{
            validator:function(value){
                return   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message:"Please enter a valid email address"
        }
    },
    password:{
        type:String,
        required:true
    },
    StudentQuestions:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'sstudentQuestions'
      }
    ]

},{timestamps:true})


//student model
let studentModel = mongoose.model("students",StudentSchema);

module.exports = studentModel;
