    // src/app.ts

import Fastify from "fastify";
import mercurius from "mercurius";
import jwt from '@fastify/jwt';
import * as jwtVerify from "jsonwebtoken";
import { connectDB } from "./db";
import { schema } from "./graphql"
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { initSocket } from "./lib/socket";


const app = Fastify({ logger: true });

initSocket(app.server);

app.register(jwt, { secret: process.env.JWT_SECRET || "supersecret" });

connectDB();

app.register(cookie, {
  secret: process.env.SESSION_SECRET ?? "kervah_supersecret_343434539dfmdf",
});


app.register(cors, {
  origin: [
    "http://localhost:3000",
    "https://kervah.co.uk",
    "https://lowis.vercel.app"

  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

app.addHook("preHandler", (req, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "https://kervah.co.uk");
  reply.header("Access-Control-Allow-Credentials", "true");
  done();
});


app.register(mercurius, {
  schema,
  graphiql: true,
    context: async (request, response) => {
    let auth = false;
    let user = null;
    const sessionCookie = request.cookies?.session; 
    // const token = request.headers.authorization?.replace("Bearer ", "");

    console.log("Session cookie", sessionCookie)

     if (!sessionCookie) {
      return { auth, user };
    }

    try {
      const decoded = jwtVerify.verify(
        sessionCookie,
        process.env.SESSION_SECRET || "kervah_supersecret_343434539dfmdf"
        
      );
      if (decoded && typeof decoded === "object") {
        auth = true;
        user = decoded.user?.id ?? null;  // only return id
      }
    } catch (err) {
      console.error("Invalid session cookie:", err);
    }
    return { auth, user, response, request };
  },
})
const PORT = process.env.PORT || 9000;

app.listen({ port: Number(PORT), 
  host: "0.0.0.0"  }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server running at ${address}/graphiql`);
});