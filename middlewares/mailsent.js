const nodemailer=require("nodemailer")



module.export=async(email,subject,text)=>{
    try{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: 'clientak1998@gmail.com',
                pass: 'yjfpjdrqummlcmdk'   //./app password in gmail settings
            }
            });


        let info = await transporter.sendMail({
            from: '"AK" <clientak1998@gmail.com>', // sender address
            to: "analbiswas180@gmail.com", // list of receivers
            subject: "Hello ak", // Subject line
            text: "Hello world ak", // plain text body
            html: "<b>Hello world?</b>", // html body
          });
    
          console.log("Message sent: %s", info.messageId);
          res.json(info)
    }
    catch(err){
        console.log(err);
        console.log("Message not sent");

    }
}
// let testAccount = await nodemailer.createTestAccount();
//     //connect with smtp

//    const transporter = nodemailer.createTransport({
//     service:'gmail',
//     auth: {
//         user: 'clientak1998@gmail.com',
//         pass: 'yjfpjdrqummlcmdk'   //./app password in gmail settings
//     }
//     });
//     try{
//         let info = await transporter.sendMail({
//             from: '"AK" <clientak1998@gmail.com>', // sender address
//             to: "analbiswas180@gmail.com", // list of receivers
//             subject: "Hello ak", // Subject line
//             text: "Hello world ak", // plain text body
//             html: "<b>Hello world?</b>", // html body
//           });
    
//           console.log("Message sent: %s", info.messageId);
//           res.json(info)
//     }catch(err){
//         console.log(err);
//     }