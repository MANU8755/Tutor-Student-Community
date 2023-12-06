// welcome to tutor and student communtiy node.js project along with the jwt authorization

const mongoose = require('mongoose');
const express = require('express');
const bcrpytPass = require('bcryptjs');
const jwtToken = require('jsonwebtoken');

const middlewareToken = require("./verifyToken");
const tutorModel = require("./models/TutorModel");
const answerModel = require("./models/tutorAnswers");
const studentModel = require('./models/studentModel');
const secretkey = require('./constants');
const studentQuestionModel = require('./models/studentQuestionModel');
const tokenVerification = require('./verifyToken');
//intially we will create student role authentication
//req-request parameter
//res-response parameter
//err-error


//database connecton
let databaseConnection = mongoose.connect("mongodb://localhost:27017/OnlineTutorManagementSystem")
    .then((data) => {
    })
    .catch((err) => {
        console / log(err);
    })




// creating express object to get the access and creating for the end points
let OnlineTutorApp = express();
//this is used to get data chunk b chunk and add it in the request body
OnlineTutorApp.use(express.json());

//post request for student registration
OnlineTutorApp.post("/studentRegistration", (req, res) => {
    //this body has be invoke by the inbuild middleware which is invoked by the express module 
    //we have to store the password in the hashing form
    //so we are using bcrpyt.js module to perform hashing/encrption of password
    //This unique randomly generated string provides an additional level of security for a generated hash. Before the plain password is hashed, a salt is generated. Then, it is appended to the plain password, and everything is hashed (the plain password and salt). This help protects against rainbow 
    //table attacks because attackers can randomly guess users’ passwords, but they can’t guess the salt.
    let registrationBody = req.body;
    bcrpytPass.genSalt(10, (error, generatedSalt) => {
        if (!error) {
            bcrpytPass.hash(registrationBody.password, generatedSalt, (err, hashedPassword) => {
                if (!err) {
                    registrationBody.password = hashedPassword;
                    //now we have to store the whole student body in the database
                    studentModel.create(registrationBody)
                        .then((data) => {
                            res.send("you have successfully registerd as a student");
                        })
                        .catch((err) => {
                            res.status(500).send({ message: "something happened try again" });
                            console.log(err);
                        })
                }
                else {
                    res.status(500).send({ message: "some Problem happened" })
                }
            })
        }
    })
});

OnlineTutorApp.post("/studentLogin", (req, res) => {
    let body = req.body;
    studentModel.findOne({ $or: [{ email: body.email }, { userName: body.email }] })
        .then((studentData) => {
            if (!studentData) {
                return res.status(404).send({ message: "User not found" });
            }
            let hashedPassword = studentData.password;

            bcrpytPass.compare(body.password, hashedPassword, (error, result) => {
                if (error) {
                    return res.status(500).send({ message: "Error comparing passwords" });
                }

                if (result) {
                    // console.log(key);
                    jwtToken.sign({ email: studentData.email }, secretkey, (err, token) => {
                        if (!err) {
                            res.send({ token });
                        } else {
                            // console.log(err);
                            res.status(500).send({ message: "Error signing token" });
                        }
                    });
                } else {
                    res.status(401).send({ message: "Incorrect password" });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Something happened" });
        });
});


//create question post by students and then they can upload their questions in the public community
OnlineTutorApp.post("/students", middlewareToken, (req, res) => {
    let questionBody = req.body;
    let studentuserName = questionBody.studentUserName;
    studentQuestionModel.create(questionBody)
        .then((QuestionData) => {
            let questionId = QuestionData._id;
            studentModel.findOne({ userName: studentuserName })
                .then((studenData) => {
                    studentModel.updateOne({ userName: studentuserName }, { $push: { StudentQuestions: questionId } })
                        .then((updatedData) => {
                            console.log(updatedData);
                            if (updatedData.modifiedCount > 0) {
                                res.send("Successfully posted the doubt to the public community");
                            }
                            else {
                                res.status(500).send({ message: "something happened while adding questions into the array" });
                            }
                        })
                        .catch((error) => {
                            res.status(500).send({ message: "Student not find" });

                        })
                })
                .catch((err) => {
                    res.status(500).send({ message: "Student not find" });
                })
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({ message: "Please enter a valid string " })
        })
})

// get details of all questions which are posted by the students
OnlineTutorApp.get("/students", tokenVerification, (req, res) => {
    studentQuestionModel.find()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "something happened while getting details" })
        })

})

// //student can update their questions  which details are visible to the public
OnlineTutorApp.put("/students/:id", tokenVerification, async (req, res) => {
    let UpdatedBody = req.body;
    try {
        let data = await studentModel.findOne({ userName: UpdatedBody.studentUserName });
        if (data !== null) {
            let result = await studentQuestionModel.updateOne({ _id: req.params.id }, UpdatedBody)
            if (result.modifiedCount > 0) {
                res.send({ message: "successfully updated the product" })
            }
            else {
                res.status(500).send("something happened");
            }
        }
    }
    catch (err) {
        res.status(500).send({ message: "something happened while updating details" })
    }

})

// //finally student can delete all t:he posted questions which are posted in  the public
OnlineTutorApp.delete("/students/:id/:userName", tokenVerification, (req, res) => {
    let object_id = req.params.id;
    let userName = req.params.userName;
    studentQuestionModel.deleteOne({ _id: object_id })
        .then((data) => {
            console.log(data);
            if (data.deletedCount > 0) {
                studentModel.findOne({ userName: userName })
                    .then((studentData) => {
                        //to delete the object_id which is stored in the StudentQuestions array
                        let index = studentData.StudentQuestions.findIndex((obj) => {
                            return obj == object_id;
                        });
                        if (index !== -1) {
                            studentData.StudentQuestions.splice(index, 1);
                            studentData.save().
                                then(() => {
                                    res.send({ message: "successfully deleted the question" });
                                })
                                .catch((err) => {
                                    res.status(500).send({ message: "Error saving changes: " + err.message });
                                });
                        }
                        else {
                            res.status(500).send({ message: "selected id is not found in the database" })
                        }

                    })

            } else {
                res.status(500).send({ message: "selected id not found" });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: "something happened while deleting details" })
        });

});


//===================================student endpoints over=========================


// //from here we have the endpoints for thr tutor/professor
// //who are ready to solve the questions which are posted by the students
// //TutorSchema

OnlineTutorApp.post("/teacherRegistration", (req, res) => {
    let tutorDetailsBody = req.body;
    bcrpytPass.genSalt(10, (err, salt) => {
        if (!err) {
            bcrpytPass.hash(tutorDetailsBody.password, salt, (err, hashedPassword) => {
                if (err == null) {
                    tutorDetailsBody.password = hashedPassword;
                    console.log(hashedPassword);
                    tutorModel.create(tutorDetailsBody)
                        .then((data) => {
                            console.log(data);
                            res.send("you have successfully registered as a tutor");
                        })
                        .catch((err) => {
                            res.status(500).send({ message: "something happened while registering the tutor data" });
                        })
                }
                else {
                    res.status(500).send({ message: "something happened while hashing the password" })

                }

            })
        }
        else {
            res.status(500).send({ message: "something happened while generating salt" })

        }
    });




})

// //tutorLogin
OnlineTutorApp.post("/tutorLogin", async (req, res) => {
    let requesBody = req.body;
    try {
        let data = await tutorModel.findOne({ $or: [{ email: requesBody.email }, { userName: requesBody.userName }] });
        jwtToken.sign({ email: requesBody.email }, secretkey, (err, token) => {
            if (!err) {
                res.send(token);
            }
            else {
                res.status(500).send({ message: "something happened while generating the token" });
            }
        })

    }
    catch (error) {
        res.status(500).send({ message: "something happened while getting tutor details" });
    }
})

// //Tutor can also post the answers to solve the students doubts which are posted by them
OnlineTutorApp.post("/tutor", tokenVerification, async (req, res) => {
    let answersBody = req.body;
    try {
        let data = await tutorModel.findOne({ userName: answersBody.TutorUserName });
        let answerData = await answerModel.create(answersBody);
        let updateId = data.tutorAnswers.push(answerData._id);
        let save = await data.save();
        res.send("successfully added the answers")
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "something happened while fetching the user data" });
    }
})


//After login Tutor has Access to see the post which are posted by the students in the public  
// and also tutor can read his own answers which are posted by him
OnlineTutorApp.get("/tutor/:userName", tokenVerification, (req, res) => {
    answerModel.find({ TutorUserName: req.params.userName }).populate("question")
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({ message: "something happened while fetching the user data" });

        })
})



//Tutor can update his answers
OnlineTutorApp.put("/tutor/:id", tokenVerification, (req, res) => {
    answerModel.updateOne({ _id: req.params.id }, req.body)
        .then((data) => {
            res.send("successfully updated the data");
        })
        .catch((err) => {
            res.status(500).send({ message: "something happened while fetching the user data" });
        })
})

// //Tutor can delete his own answers which are posted by him
//delte the answers from answers collection along with the tutors array and saving the document
OnlineTutorApp.delete("/tutor/:id", async (req, res) => {
    try {
        let answerData = await answerModel.findOne({ _id: req.params.id });
        let tutorData = await tutorModel.findOne({ userName: answerData.TutorUserName });
        let index = tutorData.tutorAnswers.findIndex((obj) => {
            return obj == answerData._id;
        });
        tutorData.tutorAnswers.splice(index, 1);
        tutorData.save()
            .then((data) => {})
            .catch((err) => {
                res.status(500).send("Something happened while deleting");
            });

        const deletedAnswer = await answerModel.deleteOne({ _id: req.params.id });
        if (deletedAnswer.deletedCount > 0) {
            res.send("Successfully updated the data");
        } else {
            res.status(500).send("Something happened while deleting");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something went wrong", error: err });
    }
});

OnlineTutorApp.listen(8000, () => {
    console.log("sever is connected and up and running");
})