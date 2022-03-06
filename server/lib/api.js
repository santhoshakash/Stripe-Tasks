"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const customers_1 = require("./customers");
const firebase_1 = require("./firebase");
const billing_1 = require("./billing");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
const cors_1 = __importDefault(require("cors"));
exports.app.use((0, cors_1.default)({ origin: true }));
exports.app.use(express_1.default.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
}));
exports.app.use(decodeJWT);
async function decodeJWT(req, res, next) {
    var _a, _b;
    if ((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.startsWith("Bearer ")) {
        const idToken = req.headers.authorization.split("Bearer ")[1];
        try {
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            req["currentUser"] = decodedToken;
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
}
exports.app.get("/test", (req, res) => {
    const amount = req.body.amount;
    res.status(200).send({ with_tax: amount * 7 });
});
/**
 * Checkouts
 */
const checkout_1 = require("./checkout");
// import { createPaymentIntent } from "./payments";
const payments_1 = require("./payments");
// import { createSubscription } from "./billing";
exports.app.post("/checkouts", runAsync(async ({ body }, res) => {
    res.send(await (0, checkout_1.createStripeCheckoutSession)(body.line_items));
}));
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
// ////its for error when user not exist
function validateUser(req) {
    const user = req["currentUser"];
    if (!user) {
        throw new Error("You must be logged in to make this request. i.e Authroization: Bearer <token>");
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
exports.app.post("/payments", runAsync(async ({ body }, res) => {
    console.log("hellow");
    res.send(await (0, payments_1.createPaymentIntent)(body.amount));
}));
// /**
//  * Customers and Setup Intents
//  */
// // Save a card on the customer record with a SetupIntent
exports.app.post("/wallet", runAsync(async (req, res) => {
    const user = validateUser(req);
    const setupIntent = await (0, customers_1.createSetupIntent)(user.uid);
    res.send(setupIntent);
}));
// // Retrieve all cards attached to a customer
exports.app.get("/wallet", runAsync(async (req, res) => {
    const user = validateUser(req);
    const wallet = await (0, customers_1.listPaymentMethods)(user.uid);
    res.send(wallet.data);
}));
exports.app.post("/subscriptions", runAsync(async (req, res) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    console.log(plan);
    const subscription = await (0, billing_1.createSubscription)(user.uid, plan, payment_method);
    res.send(subscription);
}));
// Get all subscriptions for a customer
exports.app.get("/subscriptions", runAsync(async (req, res) => {
    const user = validateUser(req);
    const subscriptions = await (0, billing_1.listSubscriptions)(user.uid);
    res.send(subscriptions.data);
}));
exports.app.patch("/subscriptions/:id", runAsync(async (req, res) => {
    const user = validateUser(req);
    res.send(await (0, billing_1.cancelSubscription)(user.uid, req.params.id));
}));
//# sourceMappingURL=api.js.map