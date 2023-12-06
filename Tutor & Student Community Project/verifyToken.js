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
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhcmEucGF0ZWxAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDE3Nzg4NzB9.Q9YeUxtdS1OYApGKJUZKT4lrCXT9e383YDeVVUv8xMs
//{
//     "email": "sara.patel@example.com",
//     "password": "sara@2023!"
//   }
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDE4NDQwNjB9.nVa1q5JZSm4u1vCgWPxLew0vIMmwx9oE2x5yLLL_g9w
//tokem for jhon toe
