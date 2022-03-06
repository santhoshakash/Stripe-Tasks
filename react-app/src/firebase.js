import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3TxqEkL5Fg0V21Z7xAdsCBVKeyHx4iRk",
  authDomain: "stripe-pro.firebaseapp.com",
  projectId: "stripe-pro",
  storageBucket: "stripe-pro.appspot.com",
  messagingSenderId: "687708775190",
  appId: "1:687708775190:web:9bddb0ee57596123236637",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();
