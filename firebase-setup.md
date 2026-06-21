# Firebase Setup for Global Tracking

## Quick Setup (2 minutes)

1. Go to https://firebase.google.com
2. Click "Get Started" → Sign in with Google
3. Create a new project (name it "TrackSuite")
4. Skip Analytics → Create Project
5. Go to "Build" → "Realtime Database" → Create Database
6. Choose location closest to you, start in **Test Mode**
7. Copy your database URL from the data tab (looks like: `https://your-project.firebaseio.com`)

## Get Your Firebase Config

1. In Firebase Console, click ⚙️ Settings → Project Settings
2. Scroll down to "Your apps" section
3. Click "Add app" → Web → Register App
4. Copy the entire `firebaseConfig` object

## Add to Your Code

Replace the placeholder in `index.html`, `admin.html`, and `script.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://your-project.firebaseio.com"
};
```

## Security Rules (After Testing)

Once you confirm it works, update Firebase Database Rules to:

```json
{
  "rules": {
    "tracking": {
      ".read": true,
      ".write": false
    },
    "admin_data": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Then enable **Google Authentication** in Firebase Console under "Build" → "Authentication".

Your app will now be accessible globally on any browser/device! 🌍
