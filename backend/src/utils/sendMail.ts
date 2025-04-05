import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import dotenv from "dotenv";
dotenv.config();
export const sendMail = async (
	to: string,
	subject: string,
	data: any,
	file: string,
) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.MAIL_HOST,
				pass: process.env.MAIL_PASS,
			},
		});

		const mailTemplate = (templateName: string, data: any): string => {
			const filepath = path.join(
				__dirname,
				`../template/${templateName}.hbs`,
			);
			const source = fs.readFileSync(filepath, "utf-8");
			const template = handlebars.compile(source);
			return template(data);
		};

		const htmlContent = mailTemplate(file, data);
		const mail = await transporter.sendMail({
			to: to,
			from: process.env.MAIL_HOST,
			subject: subject,
			html: htmlContent,
		});
		if (mail) {
			return {
				success: true,
				isError: false,
				messge: "Email Send Successfully",
			};
		}
	} catch (err) {
		if (err instanceof Error) {
			return { success: true, isError: true, message: err.message };
		}
	}
};
