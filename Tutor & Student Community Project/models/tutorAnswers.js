//tutor/trianer answers schema
const mongoose = require('mongoose');
let answerSchema = mongoose.Schema({
    question:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"studentQuestions"
    },
    answerTitle:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
        required:true
    },
    TutorUserName:{
        type:String,
        required:true,
    }
});

let answerModel = mongoose.model("tutorAnswers",answerSchema);

module.exports = answerModel;