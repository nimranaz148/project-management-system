import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const  mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Project Manager',
        link: 'https://taskmanagelink.com'
        
    }
 });
   // email in text format
   const emailText =mailGenerator.generatePlaintext(options.mailgenContent);


   // email in html format
   const emailHTML = mailGenerator.generate(options.mailgenContent);


   // creating transport for sending emails

   const transporter = nodemailer.createTransport({
     host: process.env.MAILTRAP_SMTP_HOST,
     port: process.env.MAILTRAP_SMTP_PORT,
     secure: false, // Use true for port 465, false for port 587
     auth: {
       user: process.env.MAILTRAP_SMTP_USER,
       pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

   // defining email options
    const mail = {
        from:'mail.taskmanager@example.com',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML,
    };

    // send email
    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
        
    }


}



//---------------------------EMAIL VERIFICATION MAILGEN CONTENT---------------------------//
const emailverificationmailgencontent = (username, verificationURL) => {
    return {
        body: {
        name: username,
        intro: 'Welcome to Our App! We\'re very excited to have you on board.',
        action: {
            instructions: 'Please click the following button to verify your account:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Confirm your account',
                link: verificationURL
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
}

//---------------------------FORGOT PASSWORD MAILGEN CONTENT---------------------------//

const forgetpasswordverificationmailgencontent = (username, passwordresetURL) => {
    return {
        body: {
        name: username,
        intro: 'You have requested to reset your password.Please click the following button to reset your password:',
        action: {
            instructions: 'Click the following button to reset your password:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Confirm your account',
                link: passwordresetURL
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
}

export {
    emailverificationmailgencontent,
    forgetpasswordverificationmailgencontent,
    sendEmail
}