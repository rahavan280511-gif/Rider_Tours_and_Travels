# 🚀 Rider Tours & Travels — Deployment Guide

This guide details step-by-step how to deploy both the **Express Backend** and **Next.js Frontend** to production cloud providers (Render & Vercel) connected to your **MongoDB Atlas** database.

---

## 📋 Architecture & Platform Choices

- **Database**: MongoDB Atlas (Cloud Managed Database)
- **Backend API**: Render.com (Node.js / Express Web Service)
- **Frontend App**: Vercel.com (Next.js Application)

---

## 🔹 STEP 1: Deploy Backend API to Render.com

1. Sign in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your repository `rahavan280511-gif/Rider_Tours_and_Travels`.
4. Configure the Web Service settings:
   - **Name**: `rider-tours-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables** under the **Environment** tab:

   | Key | Value / Example |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://...` (Your MongoDB Atlas connection string) |
   | `JWT_SECRET` | `your_secure_jwt_secret_2026` |
   | `ALLOWED_ORIGIN` | `https://your-frontend.vercel.app` (Your Vercel URL once created) |
   | `WHATSAPP_TOKEN` | Meta WhatsApp Cloud API Access Token |
   | `PHONE_NUMBER_ID` | `1299439553252195` |
   | `WHATSAPP_NUMBER_1` | `919841580722` |
   | `WHATSAPP_NUMBER_2` | `919994765515` |
   | `WHATSAPP_TEMPLATE_NAME` | `booking_notification` |
   | `WHATSAPP_TEMPLATE_LANG` | `en_US` |

6. Click **Create Web Service**. Once built, copy your backend URL (e.g. `https://rider-tours-backend.onrender.com`).

---

## 🔹 STEP 2: Deploy Frontend App to Vercel

1. Sign in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository `rahavan280511-gif/Rider_Tours_and_Travels`.
4. Configure Project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Select `frontend`
5. Under **Environment Variables**, add:

   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://rider-tours-backend.onrender.com/api` (Replace with your actual Render backend URL) |

6. Click **Deploy**. Vercel will build and launch your production site!

---

## 🔹 STEP 3: Connect Frontend URL to Backend CORS

Once Vercel assigns your production frontend URL (e.g. `https://rider-tours.vercel.app`):
1. Go back to Render.com → **Environment**.
2. Update `ALLOWED_ORIGIN` to your Vercel URL: `https://rider-tours.vercel.app`.
3. Save changes (Render will automatically redeploy with the updated CORS policy).

---

## 🛠️ Verification Checklist

- [x] Backend connects successfully to MongoDB Atlas in production (`connectDB()`).
- [x] `NEXT_PUBLIC_API_URL` routes API calls correctly to Render backend.
- [x] Admin Login (`/admin/login`) issues production JWT tokens.
- [x] User Booking submissions write to MongoDB Atlas and trigger WhatsApp alerts.
- [x] Admin Dashboard (`/admin/dashboard`) renders bookings and generates PDF Log Sheets seamlessly.
