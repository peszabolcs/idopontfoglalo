// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC9GIwKAJCZWaZgX844jlrf_1wuqtbcseQ',
  authDomain: 'idopontfoglalo-bb74c.firebaseapp.com',
  projectId: 'idopontfoglalo-bb74c',
  storageBucket: 'idopontfoglalo-bb74c.appspot.com',
  messagingSenderId: '825601640477',
  appId: '1:825601640477:web:8216d92384f191444cdef4',
};

// Don't initialize Firebase here, let Angular handle it
// const app = initializeApp(firebaseConfig);

export const environment = {
  production: false,
  firebase: firebaseConfig,
};
