Project ID	smart-vision-888
Project name	SMART VISION
Project number	485212580203
Основной хостинг	smart-vision-888.web.app (основной сайт)
Тестовый хостинг	smartvision-test.web.app и test.smartvision.life

Консоль	https://console.firebase.google.com/project/smart-vision-888/hosting/sites/smartvision-test

На компе Папка C:\TEST
Хостинг: 
smartvision-test.web.app
smartvision-test.firebaseapp.com
test.smartvision.life

ГИТ
https://github.com/GregoryTaran/smart-vision/tree/test

СТРУКТУРА ПАПОК

index.html — главная страница сайта.
html/ — дополнительные страницы (например: политика, контакты, о проекте).
css/ — все стили оформления (цвета, шрифты, адаптивность).
js/ — вся логика на стороне клиента: кнопки, меню, звук, запросы к API.
assets/ — изображения, иконки, логотипы и другие медиафайлы.
functions/ — серверная логика (Firebase Functions): обработка запросов, интеграции, TTS, Whisper и т.д.
.well-known/ — системная папка для SSL и доменных проверок.
.github/ — автоматизация деплоя, тестов и CI/CD (если используется).
firebase.json — основной файл конфигурации Firebase (хостинг, функции).
.firebaserc — содержит ID проекта Firebase и связи с хостингами.
.gitignore — список файлов и папок, которые Git не должен отслеживать.
README.md — документ с описанием проекта (отображается на GitHub).
package.json — настройки Node.js: зависимости, версии, скрипты.



Предлагаю называть файлы по решаемой задаче
1.html
1.css
1.js
и т.д.




Smart Vision — System of Keys and Secrets
Project ID: smart-vision-888
Test Hosting: smartvision-test.web.app / test.smartvision.life
Main Hosting: smart-vision-888.web.app
Web API Key: AIzaSyATQYyB5RbbKqIEN-STvBiVlxPjPRBAtF8

📁 Key Locations and Purpose
Level	Storage	Description
1. Local Development	.env (in project root, ignored by Git)	Contains test API keys for local debugging. Example:
OPENAI_API_KEY, GOOGLE_TTS_API_KEY, WEB_API_KEY
2. Firebase Cloud Functions	Firebase Secret Manager	Production secrets stored securely in Google Cloud:
bash<br>firebase functions:secrets:set OPENAI_API_KEY<br>firebase functions:secrets:set GOOGLE_TTS_API_KEY<br>
3. GitHub CI/CD	Repository Secret: FIREBASE_SERVICE_ACCOUNT_SMART_VISION_888	Grants GitHub Actions secure deploy access to Firebase Hosting and Functions
4. Firebase Web App	Public Web API Key	Used by browser-side Firebase SDK for auth and analytics — safe to expose

C:\TEST
│
├── .env                  # local keys (ignored by Git)
├── .gitignore            # excludes .env and private files
├── .firebaserc           # project = smart-vision-888
├── firebase.json         # site = smartvision-test
├── functions/            # cloud logic, reads Firebase Secrets
├── html/, css/, js/      # frontend code
└── .github/workflows/    # CI/CD pipeline (optional)

Protection Rules
.env and all secret files are excluded via .gitignore
Firebase Secrets are encrypted and versioned in Google Cloud
GitHub Secret (FIREBASE_SERVICE_ACCOUNT_SMART_VISION_888) provides deploy access only to this repo
Firebase Web API key is public and safe, cannot expose backend or database
Deploy uses explicit command:<br>firebase deploy --only hosting:smartvision-test


