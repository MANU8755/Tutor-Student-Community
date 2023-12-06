//explicit middileware function to verify the token
const jwt = require('jsonwebtoken');
const secretkey = require("./constants");

//it will verify the token whether it is correct or not
function tokenVerification(req,res,next){
    let requestBody = req.body;
    if(req.headers.authorization !== undefined){
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token,secretkey,(error,data)=>{
            if(error == null){
                next();
            }
            else{
                res.status(500).send({message:"please enter the valid jwt details"})
            }
        })

    }
    else{
        res.status(500).send({message:"please mention the jsonwebtoken to validat"})
    }
}
module.exports = tokenVerification;

