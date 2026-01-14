import { Resend } from "resend";
import ejs from "ejs";
import * as path from "path";
require("dotenv").config({ path: "../.env" });

const resend = new Resend(process.env.RESEND_API_KEY);


export const sendBillingInformationEmail = async (
    email:string,
    businessName:string, 
    stripeInvoiceId: string,
    amount: number,
    currency: string,
    quantity:number,
    description:string,
    periodStart:Date,
    periodEnd:Date) => {
const html = await ejs.renderFile(
  path.join(__dirname, "../emails/invoice.ejs"),
  {
    businessName,
    stripeInvoiceId,
    amount,
    currency,
    quantity,
    description,
    periodStart,
    periodEnd,
  }
);

await resend.emails.send({
  from: `${process.env.KERVAH_EMAIL}`,
  to: email,
  subject: `Payment received – ${businessName}`,
  html,
});

}
