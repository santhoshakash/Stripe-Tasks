import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { FirebaseAppProvider } from "reactfire";

export const firebaseConfig = {
  apiKey: "AIzaSyA3TxqEkL5Fg0V21Z7xAdsCBVKeyHx4iRk",
  authDomain: "stripe-pro.firebaseapp.com",
  projectId: "stripe-pro",
  storageBucket: "stripe-pro.appspot.com",
  messagingSenderId: "687708775190",
  appId: "1:687708775190:web:9bddb0ee57596123236637",
};

export const stripePromise = loadStripe(
  "pk_test_51KWzjvSDTwncXAc77NjDsDMzZ2sfwMTvsuXgnA4vDqZu0e3GYVGZ58KnCQ8KB89iwZsOW3cmwL8anjhh4qhjG0RP00qoCdoh1Z"
);

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
