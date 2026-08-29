# EV Trip & Efficiency Tracker ⚡️🚗

A mobile-first web application designed to log Electric Vehicle (EV) trips, track true battery efficiency (kWh/100km), and analyze how real-world variables like speed, weather, and payload impact your vehicle's range.

## 🌟 Core Features

*   **Precision Trip Logging**: Track Odometer, Battery State of Charge (SOC), and Estimated Range to calculate exact real-world energy usage.
*   **Automated Weather Tracking**: Automatically captures starting, ending, and en-route weather conditions (temperature, season, conditions) using your device's GPS and the XWeather API.
*   **Payload Analytics**: Log passengers, pets, and luggage to see how extra weight impacts your efficiency.
*   **Multi-Leg Road Trips**: Automatically clusters sequential trips into unified "Road Trips" for holistic long-distance data.
*   **Deep Analytics**: View breakdowns of how different trip types (Urban vs. Regional), average speeds, and seasonal weather affect your battery.
*   **CSV Export**: Export all raw data and derived calculations to CSV for your own spreadsheet tracking.

---

## ⚙️ How It Works

The app is designed to be used in real-time as you drive your EV:

1.  **Start a Trip**: Before shifting into drive, start a new trip in the app. You'll input your starting Odometer, current SOC (%), and the car's current estimated range. You also define your payload (People, Dogs, Luggage) and Trip Type (Urban, Regional, etc.).
    *   *Behind the scenes: The app grabs your GPS location and pings XWeather to record the exact environmental conditions at launch.*
2.  **Log Waypoints (Optional)**: If you are on a long regional drive, you can log "Waypoints" while stopped (e.g., at a charger). This grabs a fresh GPS coordinate and weather snapshot to improve the average weather accuracy for the trip.
3.  **End Trip**: When you arrive, input your final Odometer, SOC, and Estimated Range. 
    *   *Behind the scenes: The app fetches your final weather data, calculates the total distance, time elapsed, true average speed, and exact kWh used (calculated against an 82.5 kWh battery pack).*
4.  **Analyze**: Visit the History and Analytics tabs to see how this trip compared to your baseline averages. 

---

## 🚨 IMPORTANT: API Key Requirements

To clone and run this application yourself, you will need to set up a few external services. 

### 1. XWeather API (Required)
This app relies heavily on **XWeather (formerly AerisWeather)** to automatically fetch seasonal and environmental data based on the device's GPS coordinates. 

**You MUST obtain your own XWeather API credentials to run this app:**
1. Sign up for an account at [XWeather](https://www.xweather.com/).
2. Generate an API Application to get your `Client ID` and `Client Secret`.
3. Add these to your `.env` file (see setup instructions below).

### 2. Firebase (Required)
The app uses Firebase Authentication and Firestore for secure, real-time cloud data storage so your logs are saved across devices.
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Email/Password).

---

## 🛠️ Local Setup & Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/ev-trip-tracker.git
cd ev-trip-tracker
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root of the project and add your respective API keys. 

```env
# XWeather API Credentials (REQUIRED)
VITE_XWEATHER_CLIENT_ID=your_xweather_client_id_here
VITE_XWEATHER_CLIENT_SECRET=your_xweather_client_secret_here

# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**4. Start the Development Server**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🔋 Battery Assumptions
**Note:** This application's internal energy calculations currently assume an **82.5 kWh** usable battery pack size to calculate exact energy consumed from SOC percentage drops. If your EV has a different battery capacity, you will need to adjust the `82.5` multiplier located in the `ActiveTripTab` and `HistoryTab` calculation logic.

## 💻 Tech Stack
*   **Framework**: React 18 with Vite
*   **Styling**: Tailwind CSS
*   **Database & Auth**: Firebase / Firestore
*   **Icons**: Lucide React
*   **Weather Data**: XWeather API

---

## 🖼️ App Images
<img width="1156" height="722" alt="1" src="https://github.com/user-attachments/assets/9e2ea618-af91-4c77-b634-634ccf4a881d" />
<img width="1127" height="715" alt="2" src="https://github.com/user-attachments/assets/1c141bc5-263c-427f-b7a2-0107c3fb533d" />
<img width="1154" height="721" alt="3" src="https://github.com/user-attachments/assets/56d495d1-ebee-4211-9dbc-307ebd94814f" />
<img width="1155" height="716" alt="4" src="https://github.com/user-attachments/assets/5f88d771-b1cf-4419-a6b9-b95b0db9ee76" />
<img width="1154" height="719" alt="5" src="https://github.com/user-attachments/assets/600262bd-864d-4b12-ba36-749f190cd632" />
<img width="1151" height="720" alt="6" src="https://github.com/user-attachments/assets/10b5cacd-8a54-4b68-b632-ac8e23bde17e" />
<img width="1281" height="741" alt="7" src="https://github.com/user-attachments/assets/7faf8da0-b499-4280-b77c-22a83a7b92ef" />
