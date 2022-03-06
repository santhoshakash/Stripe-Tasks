import express, { NextFunction, Request, Response } from "express";
import { createSetupIntent, listPaymentMethods } from "./customers";
import { auth } from "./firebase";
import {
  createSubscription,
  cancelSubscription,
  listSubscriptions,
} from "./billing";

export const app = express();

app.use(express.json());

import cors from "cors";

app.use(cors({ origin: true }));

app.use(
  express.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
  })
);
app.use(decodeJWT);

async function decodeJWT(req: Request, res: Response, next: NextFunction) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req["currentUser"] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

app.get("/test", (req: Request, res: Response) => {
  const amount = req.body.amount;
  res.status(200).send({ with_tax: amount * 7 });
});

/**
 * Checkouts
 */
import { createStripeCheckoutSession } from "./checkout";
// import { createPaymentIntent } from "./payments";
import { createPaymentIntent } from "./payments";
// import { createSubscription } from "./billing";

app.post(
  "/checkouts",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(body.line_items));
  })
);

function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };
}
// ////its for error when user not exist
function validateUser(req: Request) {
  const user = req["currentUser"];
  if (!user) {
    throw new Error(
      "You must be logged in to make this request. i.e Authroization: Bearer <token>"
    );
  }

  return user;
}

// // ///payements

// app.post(
//   "/payments",
//   // runAsync(async ({ body }: Request, res: Response) => {
//   //   res.send(await createPaymentIntent(body.amount));
//   // })
//   async (req: Request, res: Response) => {
//     res.send(await createPaymentIntent(req.body.amount));
//   }
// );
app.post(
  "/payments",
  runAsync(async ({ body }: Request, res: Response) => {
    console.log("hellow");
    res.send(await createPaymentIntent(body.amount));
  })
);

// /**
//  * Customers and Setup Intents
//  */

// // Save a card on the customer record with a SetupIntent
app.post(
  "/wallet",
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const setupIntent = await createSetupIntent(user.uid);
    res.send(setupIntent);
  })
);

// // Retrieve all cards attached to a customer
app.get(
  "/wallet",
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const wallet = await listPaymentMethods(user.uid);
    res.send(wallet.data);
  })
);

app.post(
  "/subscriptions",
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    console.log(plan);
    const subscription = await createSubscription(
      user.uid,
      plan,
      payment_method
    );
    res.send(subscription);
  })
);

// Get all subscriptions for a customer
app.get(
  "/subscriptions",
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const subscriptions = await listSubscriptions(user.uid);

    res.send(subscriptions.data);
  })
);

app.patch(
  "/subscriptions/:id",
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    res.send(await cancelSubscription(user.uid, req.params.id));
  })
);
