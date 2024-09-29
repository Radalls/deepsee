import { renderFile } from 'ejs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    auth: {
        pass: 'jyvx nyhe opno fkqn',
        user: 'deepsee.contact@gmail.com',
    },
    service: 'gmail',
});

transporter.verify(function (error) {
    if (error) {
        console.error(error);
    } else {
        console.warn('Connection to mails 👍');
    }
});

export const sendMail = async ({ templateName, data, email }: {
    data: any,
    email?: string,
    templateName: string,
}): Promise<void> => {
    const templatePath = `./templates/${templateName}.ejs`;

    const url = process.env.DOMAIN;

    const mailData = {
        ...data,
        url,
    };

    const html = await renderFile<string>(templatePath, mailData);
    const mailOptions = {
        from: 'deepsee.contact@gmail.com',
        html: html,
        subject: `Deepsee - ${data.subject}`,
        to: email ?? 'deepsee.contact@gmail.com',
    };

    try {
        transporter.sendMail(mailOptions);
    } catch (error) {
        console.warn(error);
    }
};

