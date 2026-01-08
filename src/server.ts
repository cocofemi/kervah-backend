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
import { stripe } from "./lib/stripe";
import { invoicePayment, checkoutSession, updateSubscription } from "./lib/stripeWebhook";
import Stripe from "stripe";
import fastifyRawBody from "fastify-raw-body";


async function start() {
const app = Fastify({ logger: true });

initSocket(app.server);

app.register(jwt, { secret: process.env.JWT_SECRET || "supersecret" });

await app.register(fastifyRawBody, {
  field: "rawBody",        // adds request.rawBody
  global: false,           // only enable on selected routes
  encoding: false,      // REQUIRED for Stripe
  runFirst: true,          //REQUIRED (before JSON parsing)
});

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

app.addHook("onSend", (req, reply, payload, done) => {
  const origin = req.headers.origin;

  if (
    origin === "https://kervah.co.uk" ||
    origin === "https://lowis.vercel.app" ||
    origin === "http://localhost:3000" ||
    origin === "https://www.kervah.co.uk"
  ) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Credentials", "true");
  }

  done(null, payload);
});


app.addHook("preHandler", (req, reply, done) => {
  const origin = req.headers.origin;

  if (
    origin === "https://kervah.co.uk" ||
    origin === "https://lowis.vercel.app" ||
    origin === "http://localhost:3000"
  ) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Credentials", "true");
  }

  // console.log("COOKIE SENT TO BACKEND:", req.headers.cookie);
  done();
});


app.addHook("preHandler", (req, reply, done) => {
  // console.log("COOKIE SENT TO BACKEND:", req.headers.cookie);
  done();
});


app.post("/webhook/stripe",{ config: { rawBody: true } }, async (request, reply) => {
  console.log("HI we got here")
  const sig = request.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    reply.code(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await checkoutSession(event);
        break;

      case "invoice.payment_succeeded":
        await invoicePayment(event);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updateSubscription(event);
        break;
    
      default:
        break;
    }
  
} catch (err: any) {
  console.error("❌ Handler failed:", err.message);
  return reply.code(500).send("Webhook handler error");
}

  reply.code(200).send({ received: true });
});



app.register(mercurius, {
  schema,
  graphiql: process.env.NODE_ENV === 'production',
  context: async (request, response) => {
  let auth = false;
  let user = null;
  let trialEndsAt = null;
  let activeBusinessId = null;
  let activeBusinessName = null;
  let activeBusinessPlan = null;
  let activeBusinessStatus = null;
  let activeBusinessRole = null;
  let isInternal = false
  const sessionCookie = request.cookies?.session; 
  const authHeader = request.headers.authorization;
  // const token = request.headers.authorization?.replace("Bearer ", "");


    if (authHeader === `Bearer ${process.env.INTERNAL_API_KEY}`) {
      isInternal = true;
      return {
        auth: false,
        user: null,
        isInternal,
        request,
        response,
      };
    }
    
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
      activeBusinessId= decoded?.activeBusinessId ?? null;
      activeBusinessName = decoded?.activeBusinessName ?? null;
      activeBusinessPlan= decoded?.activeBusinessPlan ?? null;
      activeBusinessStatus= decoded?.activeBusinessStatus ?? null;
      activeBusinessRole = decoded?.activeBusinessRole ?? null;
      trialEndsAt = decoded?.trialEndsAt ?? null;
    }
  } catch (err) {
    console.error("Invalid session cookie:", err);
  }

  const now = new Date();
    const trialEnded =
      activeBusinessStatus === "trialing" &&
      trialEndsAt &&
      new Date(trialEndsAt) < now;

    const subscriptionValid =
      activeBusinessRole === "super-admin" ||
      (activeBusinessStatus && ["active", "trialing"].includes(activeBusinessStatus) && !trialEnded);

    

  return { auth, user, businessId:activeBusinessId, subscriptionValid,
    role:activeBusinessRole, isInternal, response, request };
},
})
const PORT = process.env.PORT || 9000;

app.listen({ port: Number(PORT), 
  host: "0.0.0.0"  }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server running at ${address}/graphiql`);
});
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});