// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyCGXHBLs3Sxx82JH7tz6wChhUbtww3icY",
    authDomain: "finsecurity-558cc.firebaseapp.com",
    projectId: "finsecurity-558cc",
    storageBucket: "finsecurity-558cc.appspot.com",
    messagingSenderId: "32273200562",
    appId: "1:32273200562:web:484be393f5607e4877760ab"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация сервисов
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

console.log('✅ Firebase инициализирован');
