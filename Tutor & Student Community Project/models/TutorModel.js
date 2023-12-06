const mongoose  = require('mongoose');

//Tutor schema
let tutorSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:4,
        trim:true,
    },
    userName:{
        type:String,
        required:true,
        minLength:5,
        trim:true,
        unique:true,
    },
    age:{
        type:Number,
        required:true,
        //minimum age of tutor should be above 18
        min:18,
        max:45,
    },
    subject:{
        type:[String],
        required:true,
    },
    proficiencyLevel:{
        type:Number,
        required:true,
        min:10,
        max:100
    },
    profession:{
        //by using tutor profession we can easily recommended the doubts which 
        //are releated to the teacher profession.
        type:String,
        required:true,
    },
    Experience:{
        type:Number,
        required:true,
        min:1,
        max:40,
    },
    phoneNumber:{
        type:String,
        required:true,
        minLength:10
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:{
            validator:function(value){
                return   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message:"Please enter a valid emial address"
        }
    },
    password:{
        type:String,
        required:true,
        minLength:5,
    },
    tutorAnswers:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"tutorAnswers"
        }
    ]
},{timestamps:true});

//now we have to create a model which will represent the Tutor/teacher collection

let tutorModel = mongoose.model("Teachers",tutorSchema);

module.exports  = tutorModel;