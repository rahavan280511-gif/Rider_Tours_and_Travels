# ⚡ Rider Tours & Travels — Vercel Deployment Guide

This guide explains step-by-step how to deploy **BOTH the Express Backend and Next.js Frontend on Vercel**.

---

## 🌟 Recommended Option: Single Vercel Project (1-Click Deployment)

With our root `vercel.json` configuration, Vercel automatically deploys **both** your Next.js Frontend and your Express API Backend together in one Vercel project!

### Step-by-Step Instructions:

1. Sign in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `rahavan280511-gif/Rider_Tours_and_Travels`.
4. Under **Environment Variables**, add:

   | Key | Value / Example |
   | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://...` (Your MongoDB Atlas connection string) |
   | `JWT_SECRET` | `your_production_jwt_secret_2026` |
   | `WHATSAPP_TOKEN` | Meta WhatsApp Cloud API Access Token |
   | `PHONE_NUMBER_ID` | `1299439553252195` |
   | `WHATSAPP_NUMBER_1` | `919841580722` |
   | `WHATSAPP_NUMBER_2` | `919994765515` |
   | `WHATSAPP_TEMPLATE_NAME` | `booking_notification` |
   | `WHATSAPP_TEMPLATE_LANG` | `en_US` |

5. Click **Deploy**. Vercel will build:
   - Your Next.js Frontend pages at `https://your-project.vercel.app`
   - Your Express Backend API endpoints automatically at `https://your-project.vercel.app/api/...`

---

## 🔹 Alternative Option: Two Separate Vercel Projects

If you prefer keeping Backend and Frontend in separate Vercel project dashboards:

### Project 1: Backend API on Vercel
1. On Vercel, click **Add New...** → **Project**.
2. Select `rahavan280511-gif/Rider_Tours_and_Travels`.
3. Set **Root Directory** to `backend`.
4. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `WHATSAPP_TOKEN`, etc.).
5. Deploy. You will get a backend URL (e.g. `https://rider-tours-api.vercel.app`).

### Project 2: Frontend App on Vercel
1. Click **Add New...** → **Project**.
2. Select `rahavan280511-gif/Rider_Tours_and_Travels`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://rider-tours-api.vercel.app/api`
5. Deploy.

---

## 🛠️ Environment Variables Checklist for Vercel

```env
# ── Database & Auth ──
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/rider_tours?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_2026

# ── WhatsApp Cloud API ──
WHATSAPP_TOKEN=your_meta_whatsapp_token
PHONE_NUMBER_ID=1299439553252195
WHATSAPP_NUMBER_1=919841580722
WHATSAPP_NUMBER_2=919994765515
WHATSAPP_TEMPLATE_NAME=booking_notification
WHATSAPP_TEMPLATE_LANG=en_US
```

---

## ✅ Deployment Features Verified
- [x] Express backend configured as Vercel Serverless Function (`backend/api/index.js`).
- [x] Mongoose connection caching added to `backend/config/db.js` (`readyState >= 1`).
- [x] Root `vercel.json` routes `/api/*` to backend and `/*` to Next.js frontend.
- [x] Zero CORS issues when deployed as a unified Vercel project.
