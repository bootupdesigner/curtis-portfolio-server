const express = require('express');
const nodemailer = require('nodemailer');


const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.WORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,

    }
});

transporter.verify((err, success) => {
    err
        ? console.log(err)
        : console.log(`=== Server is ready to take messages: ${success} ===`);
});


app.post("/send", async function (req, res) {
    try {

        const selectedServices = req.body.mailerState.services
            .filter(service => service.selected)
            .map(service => service.name);

        const selectedContact = req.body.mailerState.contacts
            .filter(contact => contact.selected)
            .map(contact => contact.name);

        const firstMailOptions = {
            from: req.body.mailerState.email,
            to: process.env.EMAIL,
            subject: `Message from Curtis Shepard's Portfolio`,
            text: req.body.mailerState.message,
            html: `
            <div style="padding:30px;">
            <p style="font-size:18px;">You've received a message from ${req.body.mailerState.name}</p>
            <p style="font-size:18px;">Message from customer:</p>
            <ul>
                <li style="font-size:18px;">${req.body.mailerState.message}</li>
            </ul>
            <p style="font-size:18px;">Reason for inquiry:</p>       
            <ul>
                ${selectedServices.map(service => `<li style="font-size:18px;">${service}</li>`).join('')}
            </ul>
            <p style="font-size:18px;">Preferred point of contact:</p>
            <ul>
            ${selectedContact.map(contact => `<li>${contact}</li>`).join('')}
            </ul>
            <p style="font-size:18px;">Phone: ${req.body.mailerState.phone}</p>
            <p style="font-size:18px;">Email: ${req.body.mailerState.email}</p>
        </div>`
        };

        await transporter.sendMail(firstMailOptions);

        const secondMailOptions = {
            from: process.env.EMAIL,
            to: req.body.mailerState.email,
            subject: `Curtis Shepard's Portfolio Response`,
            text: `Thanks for reaching us ${req.body.mailerState.name}. Curtis will be contacting you shortly`,
            html: `
            <div>
                <h1 style="text-align:center;">Curtis Shepard | Web Developer</h1>

                <p style="font-weight:bold;font-size:18px;">Hi ${req.body.mailerState.name},</p>

                <p style="font-size:18px;">Thank you for considering me for your open position:</p>

                <ul>
                    ${selectedServices.map(service => `<li style="font-size:18px;">${service}</li>`).join('')}

                </ul>

                <p style="font-size:18px;">If you've left instructions to respond, I will contact you as soon as possible. I can be reached by <a href="tel:+19543489783">phone</a> or <a href="mailto:shepardcurtis2@gmail.com">email</a>, Monday - Friday from 8:00am to 2:00pm and from 4:00pm 8:00pm.</p>

                <br/>

                <p style="font-size:18px;">Thanks for reading,</p>

                <br/>

                <p style="font-size:18px;"><i>Curtis Shepard</i></p>

                <br/>

                <hr/>

                <p style="font-size:18px;"><strong>Curtis Shepard</strong></p>

                <p style="font-size:18px;"><a href=mailto:shepardcurtis2@gmail.com>shepardcurtis2@gmail.com</a></p>

                <p style="font-size:18px;"><a href=tel:+19543489783>(954)348-9783</a></p>

                <p style="font-size:18px;"><a href=https://bootupwebdesigns.com>bootupwebdesigns.com</a></p>
            </div>`

        };

        await transporter.sendMail(secondMailOptions);

        console.log("Emails sent successfully");
        res.json({
            status: "success"
        });
    } catch (error) {
        console.error('Error submitting second email:', error);

        res.status(500).json({
            status: "fail",
            error: "Error sending the second email. Please try again later.",
        });
    }
});





const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})