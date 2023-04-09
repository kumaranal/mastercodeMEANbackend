const tableData = require("../models/tableDataModel")
const userlogin=require("../models/loginModel")
const cloudinary = require('cloudinary').v2;
const nodemailer= require("nodemailer")
const schedule=require('node-schedule');
const cron=require('node-cron')
const shell=require('shelljs')
require('dotenv').config();

const selectivedatafn = async (req, res) => {

    tableData.find({userId:req.body.userId})
        .then((data) => {
                // console.log(data);
                data.forEach(element => {
                
                    // console.log("element",element)
                    let starttime=element.startDate;
                    let endTime=element.endDate;
                     element.startDate=`${new Date(starttime).getUTCFullYear()}-${new Date(starttime).getUTCMonth()}-${new Date(starttime).getUTCDate()}`;
                     element.endDate=`${new Date(endTime).getUTCFullYear()}-${new Date(endTime).getUTCMonth()}-${new Date(endTime).getUTCDate()}`;
    
                    //  console.log("element",element)
                    });
            return res.status(200).json({ msg: "SUCCESS", data: data })

        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({ msg: "Request Data INVALID" })
        })
};

const getfn = async (req, res) => {

    tableData.find()
        .then((data) => {
            // console.log(data);
            data.forEach(element => {
                
                // console.log("element",element)
                let starttime=element.startDate;
                let endTime=element.endDate;
                 element.startDate=`${new Date(starttime).getUTCFullYear()}-${new Date(starttime).getUTCMonth()}-${new Date(starttime).getUTCDate()}`;
                 element.endDate=`${new Date(endTime).getUTCFullYear()}-${new Date(endTime).getUTCMonth()}-${new Date(endTime).getUTCDate()}`;

                //  console.log("element",element)
                });
            
            // console.log("data2",data);
            return res.status(200).json({ msg: "SUCCESS", data: data })

        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({ msg: "Request Data INVALID" })
        })
};


const paginationgetfn = async (req, res) => {

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 2;

    let skip = (page - 1) * limit;

    tableData.find().skip(skip).limit(limit)
        .then((data) => {
            // console.log(data);
            return res.status(200).json({ msg: "SUCCESS", data: data })

        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({ msg: "Request Data INVALID" })
        })
};


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

const savefn = async (req, res) => {
    // console.log("req", req.body);
    for (const [key, value] of Object.entries(req.body)) {
        if (key != "startDate") {
            if (value == null || value == "") {
                return res.status(400).json({ msg: `${key} value is INVALID` });
            }
        }
    }
    // if ((req.files.file == "") && (req.files.file == null)) {
    //     return res.status(400).json({ msg: `file value is INVALID` });

    // }
    const file = req.files.file;
    // console.log("file",file)

    cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            const bookfile = new tableData({
                workTitle: req.body.workTitle,
                description: req.body.description,
                startDate: new Date(req.body.startDate).toISOString(),
                endDate: new Date(req.body.endDate).toISOString(),
                file: result.url,
                userId:req.body.userId
            })
            bookfile.save()
                .then(result => {
                    console.log("data",result);
                    let year=new Date(result.startDate).getUTCFullYear();
                    let month=new Date(result.startDate).getUTCMonth();
                    let day=new Date(result.startDate).getUTCDate()
                    var date = new Date(year, month, day, 13, 42, 0);

                    var job = schedule.scheduleJob(date, function(){
                        console.log("mail sent");
                        ///////
                        const transporter = nodemailer.createTransport({
                            service:'gmail',
                            auth: {
                                user: process.env.MAILSENTUSER,
                                pass: process.env.MAILSENTPASS   //./app password in gmail settings
                            }
                            });
                            try{
                                let info = transporter.sendMail({
                                    from: '"ANAL KUMAR BISWAS" <clientak1998@gmail.com>', // sender address
                                    to: req.body.userId, // list of receivers
                                    subject: result.workTitle, // Subject line
                                    text: result.description, // plain text body
                                    html: `<b>${result.description}</b>`, // html body
                                  });
                            
                                  console.log("Message sent: %s", info.messageId);
                                //   res.json(info)
                            }catch(err){
                                console.log(err);
                            }


                        ////////
                    });
                    res.status(200).json({ msg: "Success", data: result });

                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({ msg: "unSuccessfull" });

                })


        }
    })
}


const updatefn = async (req, res, next) => {

    // console.log("req", req.body);
    for (const [key, value] of Object.entries(req.body)) {
        if (value == null || value == "") {
            return res.status(400).json({ msg: `${key} value is INVALID` });
        }
    }
    const bookfile = req.body;
    if (req.files && req.files.file) {
        const file = req.files.file;
        let urlLink = "";
        await cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                urlLink = result.url;
            }
            // console.log("urlLink", urlLink)
            bookfile["file"] = urlLink
            // console.log("bookfile3", bookfile)

        })
    }
    if (req.body.startDate) {
        console.log("startDate",req.body.startDate)
        bookfile.startDate = new Date(req.body.startDate).toISOString();
        // bookfile.startDate=({
        //     startDate: new Date(req.body.startDate).toISOString()
        // })

    }
    if (req.body.endDate) {
        bookfile.endDate = new Date(req.body.endDate).toISOString();

    }
    // await console.log("bookfile2", bookfile)
    await tableData.findByIdAndUpdate(bookfile.id, { $set: bookfile }, { new: true })
        .then(data => {
            res.status(200).json({ msg: "Success", data: data });

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: "unsuccessfull" });

        })

};

const deletefn = (req, res, next) => {
    // console.log("req",req.body)
    if (req.body.id == null || req.body.id == "") {
        return res.status(400).json({ msg: `id value is INVALID` });

    }
    tableData.findByIdAndDelete(req.body.id)
        .then(data => {
            res.status(200).json({ msg: "Success" });

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: "unsuccessfull" });

        })

};

const sendgmailfn=async(req,res)=>{

    // let testAccount = await nodemailer.createTestAccount();
    //connect with smtp
    // console.log("req",req.body)
   const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.MAILSENTUSER,
        pass: process.env.MAILSENTPASS  //./app password in gmail settings
    }
    });
    try{
        let info = await transporter.sendMail({
            from: '"ANAL KUMAR BISWAS" <clientak1998@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: req.body.subject, // Subject line
            text: req.body.body, // plain text body
            html: `<b>${req.body.body}</b>`, // html body
          });
    
          console.log("Message sent: %s", info.messageId);
          res.json(info)
    }catch(err){
        console.log(err);
    }
    
}

const profileDetailsfn=async (req,res,next)=>{
    try{
        console.log("res api",req.user)
        userlogin.findById(req.user._id)
        .then(data => {
            res.status(200).json({ msg: "Success" ,data:data});

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: "unsuccessfull" });

        })

    }catch(err){
        console.log(err);
        res.status(200).json({msg:"inavlid user"});

    }
 }

const searchfn=async(req,res)=>{
    try{
        console.log("res api",req.body)
        // tableData.find(req.body)
        tableData.find({ $or:[
                               {$and:[{"startDate":{"$gte":new Date(req.body.endDate).toISOString()},"startDate":{"$lte": new Date(req.body.startDate).toISOString()}}]},
                               {$and:[{"endDate":{"$gte":new Date(req.body.endDate).toISOString()},"endDate":{"$lte": new Date(req.body.startDate).toISOString()}}]},
                               {$and:[{"endDate":{"$lte":new Date(req.body.endDate).toISOString()},"startDate":{"$gte": new Date(req.body.startDate).toISOString()}}]},
                               {$and:[{"endDate":{"$gte":new Date(req.body.endDate).toISOString()},"startDate":{"$lte": new Date(req.body.startDate).toISOString()}}]}
                            ]
            })
        .then(data => {
            res.status(200).json({ msg: "Success" ,data:data});

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: "unsuccessfull" });

        })

    }catch(err){
        console.log(err);
        res.status(200).json({msg:"inavlid user"});

    }
}

module.exports = { getfn, savefn, updatefn, deletefn, paginationgetfn,sendgmailfn,profileDetailsfn ,selectivedatafn,searchfn};