const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.template.js');

const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

try {
    let content = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar placeholders
    content = content.replace('${FIREBASE_API_KEY}', process.env.REACT_APP_FIREBASE_API_KEY);
    content = content.replace('${FIREBASE_AUTH_DOMAIN}', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
    content = content.replace('${FIREBASE_PROJECT_ID}', process.env.REACT_APP_FIREBASE_PROJECT_ID);
    content = content.replace('${FIREBASE_STORAGE_BUCKET}', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
    content = content.replace('${FIREBASE_MESSAGING_SENDER_ID}', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
    content = content.replace('${FIREBASE_APP_ID}', process.env.REACT_APP_FIREBASE_APP_ID);
    content = content.replace('${FIREBASE_MEASUREMENT_ID}', process.env.REACT_APP_FIREBASE_MEASUREMENT_ID);

    fs.writeFileSync(outputPath, content);
    // console.log('✅ Service Worker generado correctamente en public/firebase-messaging-sw.js');
} catch (error) {
    console.error('❌ Error generando el Service Worker:', error);
    process.exit(1); // Terminar con error para detener el build
}