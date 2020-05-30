import * as firebase from 'firebase';
require("@firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyBBjs67IBkxjHunM7yFyCk_P9GpV32XWyQ",
    authDomain: "wily-a9a1b.firebaseapp.com",
    databaseURL: "https://wily-a9a1b.firebaseio.com",
    projectId: "wily-a9a1b",
    storageBucket: "wily-a9a1b.appspot.com",
    messagingSenderId: "822901066419",
    appId: "1:822901066419:web:b1869658fb87cdbb4a7ec6",
    measurementId: "G-JVTGYTDQ0H"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();