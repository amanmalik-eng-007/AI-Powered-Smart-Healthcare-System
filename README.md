# AI-Powered Smart Healthcare Management System

A production-ready full-stack electronic health records and clinical operations portal designed using the **MERN stack (MongoDB, Express, React, Node)** and powered by **Google Gemini AI**. This system acts as a final year B.Tech Computer Science project.

---

## 🌟 Key Features

1. **Role-Based Protected Access**: Custom dashboards and widgets for **Patients**, **Doctors**, and **Administrators** secured with JWT tokens and bcrypt encryption.
2. **Clinical Scheduling Engine**: Book, reschedule, approve, or cancel appointments. Automatic check to avoid double-booking timeslots.
3. **AI Diagnostics Assistant**:
   - **AI Symptom Checker**: Patient enters symptoms, AI suggests possible conditions, precautions, and specialist clinic referrals.
   - **AI Report Analyzer**: Upload clinical reports (CBC, Lipid panel, etc.), AI details summary, layman translations, and flags abnormalities.
   - **AI Health Chatbot**: Friendly interactive assistant to answer general lifestyle, dietary, and drug description queries.
4. **Electronic Prescriptions & PDF Generators**: Doctors build medicine rows (dosage, frequency, duration) and generate download-ready PDF sheets.
5. **Interactive Charts**: Recharts widgets showing monthly schedules line graphs, disease distributions, and hospital metrics.
6. **Robust Fallbacks**: Complete offline operation support with keyword-triggered local mock AI diagnostics when Gemini API keys are omitted.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, React Router v6, React Toastify, Lucide Icons.
- **Backend**: Node.js, Express.js (MVC architecture, Helmet security headers, Express Rate Limit, CORS protection).
- **Database**: MongoDB + Mongoose Schemas.
- **File Upload**: Multer local disk engine (Offline-ready static directory upload mapping).
- **AI Integrations**: Google Generative AI SDK (`@google/generative-ai` Gemini-1.5-flash).
- **PDF Compiler**: PDFKit.

---

## 📂 Project Directory Map

```
smart-healthcare/
├── package.json               # Monorepo task script manager
├── README.md                  # System instruction handbook
├── backend/
│   ├── package.json           # Backend dependency lock
│   ├── server.js              # Node/Express primary entrypoint
│   ├── seed.js                # Database mock data seeder
│   ├── config/                # Database connections configuration
│   ├── models/                # User, Patient, Doctor, Appt schemas
│   ├── controllers/           # Business controller logics
│   ├── routes/                # API router mapping
│   ├── middleware/            # JWT auth guards, multer, error catchers
│   └── utils/                 # PDF generator, mock email utilities
└── frontend/
    ├── package.json           # React dependencies
    ├── vite.config.js         # Port mapping & dev backend proxy
    ├── tailwind.config.js     # Dark mode toggling & color extensions
    ├── index.html             # Google fonts loader shell
    └── src/
        ├── main.jsx           # React app bootstrapper
        ├── App.jsx            # Router and contexts container
        ├── index.css          # Tailwind imports & glassmorphism CSS
        ├── context/           # Global Auth and Theme states
        ├── services/          # Axios API endpoints map
        ├── components/        # Protected routes, Sidebar, Navbar
        └── pages/             # Authentication, Dashboards, AI panels
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-healthcare
JWT_SECRET=clinical-secret-key-99881
GEMINI_API_KEY=YOUR_GEMINI_DEVELOPER_KEY_HERE
```

*Note: If `GEMINI_API_KEY` is left blank, the portal automatically triggers its local keyword rule-based diagnostics engine so clinical operations remain testable.*

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- Install **Node.js** (v18+ recommended)
- Install **MongoDB Community Server** and ensure the database daemon is running locally:
  ```bash
  # Start MongoDB on macOS via Homebrew (if installed)
  brew services start mongodb-community
  ```

### 2. Setup Dependencies
In the root directory of the project, run:
```bash
# Installs root, backend, and frontend packages in one command
npm run install-all
```

### 3. Seed Database
Load the initial demo database schema containing administrators, patients, clinics, and appointments:
```bash
cd backend
node seed.js
cd ..
```

### 4. Boot Development Servers
From the root directory, boot both servers concurrently:
```bash
npm run dev
```
- **React Frontend**: `http://localhost:5173`
- **Express Backend**: `http://localhost:5000`

---

## 🔑 Demo Account Credentials

Use these pre-seeded accounts to explore dashboard panels:

| Role | Username | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@smarthealth.com` | `adminpassword` |
| **Patient Profile** | `patient@demo.com` | `patientpassword` |
| **Approved Cardiologist** | `house@demo.com` | `doctorpassword` |
| **Pending Doctor** | `watson@demo.com` | `doctorpassword` |

---

## 🌐 Production Deployment Guide

### Backend Deployment (Render / Heroku)
1. Push the code to a Git repository (GitHub/GitLab).
2. Create a new Web Service on Render.
3. Configure settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - Set Environment Variables: `MONGODB_URI` (MongoDB Atlas link), `JWT_SECRET`, `GEMINI_API_KEY`.

### Frontend Deployment (Vercel / Netlify)
1. Configure frontend production API requests: Set custom production endpoints inside `frontend/src/services/api.js`.
2. Connect Vercel to your GitHub repo.
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set up rewrite headers inside `vercel.json` if using custom proxy routes.
