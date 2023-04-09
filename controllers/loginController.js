const User = require("../models/loginModel")

const jwtfn = require("../middlewares/jwtauthcode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var validator = require("email-validator");
const TokenShema=require("../models/token");
const sendEmail=require("../middlewares/mailsent");
const crypto=require("crypto")
const { TokenExpiredError } = require("jsonwebtoken");

require('dotenv').config();

const JWTCODE = process.env.JWTCODE;


const getalluserfn = async (req, res) => {
    User.find()
        .then((data) => {
            console.log(data);
            return res.status(200).json({ msg: "SUCCESS", data: data })

        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({ msg: "Request Data INVALID" })
        })
};

const deleteuserfn = (req, res, next) => {
    // console.log("req",req.body)
    User.findByIdAndDelete(req.body.id)
        .then(data => {
            res.status(200).json({ msg: "Success" });

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: "unsuccessfull" });

        })

};

const registrationfn = async (req, res, next) => {
    console.log("req",req.body)
    try {
        // console.log("step1")

        const value = validator.validate(req.body.email);
        if (!value) {
            // console.log("step2")
            return res.status(400).json({ msg: "EMAIL is INVALID" });
        }
        //checking for already exist
        let userexist = await User.findOne({ email: req.body.email });
        if (userexist) {
            // console.log("step3")
            return res.status(400).json({ msg: "email already exist" });
        }
        /////// main registration fn
        let userDATA = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value == null || value == "") {
                return res.status(400).json({ msg: `${key} value is INVALID` });
            }
            // if (key == 'name' || key == 'email') {
            //     userDATA[key] = value.toUpperCase();
            // }
            // else {
                userDATA[key] = value
            // }

        }
        // console.log("step4")
        console.log("userDATA", userDATA);
        userDATA["userId"]=userDATA.email;
        console.log("userDATA", userDATA);

        //////
        User.create(userDATA)
            .then(result => {
                console.log("data", result);
                flag = true;
                {
                    const data = {
                        newuser: {
                            _id: result._id
                        }
                    }

                    const authtoken = jwt.sign({ data }, JWTCODE);
                    return res.status(200).json({ msg: "Success", token: authtoken });
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(400).json({ msg: "unSuccessfull" });

            })
    } catch (err) {
        return res.status(500).json({ msg: "failes due to error occure" });
        console.log(err);
    }

}

const loginfn = async (req, res, next) => {
    try {
        let userDATA = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value == null || value == "") {
                return res.status(400).json({ msg: `${key} value is INVALID` });
            }
            if (key == 'name' || key == 'email') {
                userDATA[key] = value.toUpperCase();
            }
            else {
                userDATA[key] = value
            }

        }
        // console.log("login cred",userDATA)
        const username = await User.findOne({ name: userDATA.name });
        // console.log("username",username.password);
        const isMatch = await bcrypt.compare(userDATA.password, username.password);
        // console.log(isMatch);
        if (isMatch) {
            const data = {
                username: {
                    _id: username._id
                }
            }
            const authtoken = jwt.sign(data, JWTCODE, { expiresIn: "1h" }); ///expire in 1 hour
            res.status(200).json({ msg: "Success", token: authtoken });

        }
        else {
            res.status(200).json({ msg: "invalid login credentials" });

        }
    } catch (err) {
        res.status(500).json({ msg: "internal problem" });
        console.log(err);
    }
}

const logincheck = async(req, res, next) => {
    // try{
    //     let user1
    //     user1=await user.findOne({_id:req.params.id});
    //     if(!user)return res.status(400).send({message:"invaild link"});

    //     const token= TokenShema.find({
    //         userId:user._id,
    //         token:req.params.token
    //     });
    //     console.log("token",token)
    //     if(!token)return res.status(400).send({message:"invalid link"});

    //     await user.updateOne({_id:user._id,verified:true})
    //     ////keramoti dekhau
    //     TokenShema.deleteOne();
    //     res.status(200).send({message:"email verified success"})
    // }catch(err){
    //     res.status(200).send({message:"email verified unsuccessfull "})
    //     console.log(err);
    // }
};


module.exports = { loginfn, registrationfn, getalluserfn, deleteuserfn,logincheck };