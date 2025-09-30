const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path")
const ejs = require("ejs")

// Intialize the Oauth2 clinet with my credentials

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

//set the refresh token
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

//GETING THE ACCESS TOKEN
const getAccessToken = async () => {
    try {
        const { token } = await oAuth2Client.getAccessToken();
        if (!token) {
            throw new Error("No access token retrieved");
        }
        return token;
    } catch (error) {
        console.error("Error retrieving access token", error.message);
        throw new Error(error.message);
    }
};

// creating the transporter for the email sending
const createTransporter = async () => {
    try {
        const accessToken = await getAccessToken();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.MAIL_HOST,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        return transporter;
    } catch (error) {
        console.error("Error creating transporter", error.message);
        throw new Error(error.message);
    }
};


// Email Template for reciving email 
const renderEmailTemplate = async (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, "..", "views", "emails", `${templateName}.ejs`)
        return await ejs.renderFile(templatePath, data)

    } catch (error) {
        console.error("Error rendering email template", error.message)
        throw new Error("Failed to render email template")
    }
}


module.exports={
    createTransporter,
    renderEmailTemplate
}