import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY);

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET": {
      const data = await resend.sendEmail({
        from: "damasomlima@gmail.com",
        to: "damaso.jscript.m@gmail.com",
        subject: "Damaso Magno",
        html: "<strong>hello word</strong>"
      });

      return res.status(200).send(data);
    }
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 