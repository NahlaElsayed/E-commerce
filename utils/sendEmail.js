const nodemailer = require("nodemailer");

const sendEmail =async (options) => {
  // 1)create taransporter{service that will send email like(gmail,mailGun,mailtRap,sendGrid)}
  const transporter=nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT, //if port secure true=465, if port false=587
    secure:true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD,
    }
  })
  // 2)define email options (like from,to,subject,contact email)
  const mailOpts={
    from:'E-shop App<nahla1ata1@gmail.com>',
    to:options.email,
    subject:options.subject,
    text:options.message
  }
  // 3)send email
  await transporter.sendMail(mailOpts)
};
module.exports = sendEmail;
