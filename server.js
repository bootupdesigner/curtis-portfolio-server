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

        const firstMailOptions = {
            from: req.body.mailerState.email,
            to: process.env.EMAIL,
            subject: `Message from Curtis Shepard's Portfolio`,
            text: req.body.mailerState.message,
            html: `
            <div>
            <p>You've received a message from ${req.body.mailerState.name}</p>
            <p>Message from customer: ${req.body.mailerState.message}</p>
            <p>Reason for inquiry:</p>       
            <ul>
            ${selectedServices.map(service => `<li>${service}</li>`).join('')}

            </ul>
        </div>`
        };

        await transporter.sendMail(firstMailOptions);

        const secondMailOptions = {
            from: process.env.EMAIL,
            to: req.body.mailerState.email,
            subject: `Curtis Shepard's Portfolio Response`,
            text: `Thanks for reaching us ${req.body.mailerState.name}. Curtis will be contacting you shortly`,

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