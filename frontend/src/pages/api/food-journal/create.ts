import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    try {
      // This should be an environment variable
      const backendUrl = "http://localhost:8080";
      const response = await axios.post(`${backendUrl}/food-journal/create`, req.body, {
        headers: {
          "Content-Type": "application/json",
          // Assuming you have a way to get the token
          Authorization: req.headers.authorization || "",
        },
      });

      res.status(201).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Error creating food journal:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
