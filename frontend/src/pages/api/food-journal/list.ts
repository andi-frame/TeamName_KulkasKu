import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    try {
      // This should be an environment variable
      const backendUrl = "http://localhost:8080";
      const response = await axios.get(`${backendUrl}/food-journal/list`, {
        headers: {
          // Assuming you have a way to get the token
          Authorization: req.headers.authorization || "",
        },
      });

      res.status(200).json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Error fetching food journals:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
