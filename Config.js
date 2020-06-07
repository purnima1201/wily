import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyD-weFxyNnKhznOqrY836qh4EtszTwCKFI",
    authDomain: "wily-a90b3.firebaseapp.com",
    databaseURL: "https://wily-a90b3.firebaseio.com",
    projectId: "wily-a90b3",
    storageBucket: "wily-a90b3.appspot.com",
    messagingSenderId: "833043568352",
    appId: "1:833043568352:web:0e0a1e5ef136f9d43de285",
    measurementId: "G-G68L0LMHRT"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();

