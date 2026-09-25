# ChurchNavigator — Production Launch & Domain Setup Runbook

This comprehensive guide covers every step required to transfer accounts, connect your Hostinger domain, configure Cloudflare, verify Google & Apple OAuth, activate Resend for live outbound emails, and secure your Supabase production database.

---

## Table of Contents
1. [Move GitHub Repository to New Account](#1-move-github-repository-to-new-account)
2. [Move Vercel to New Account](#2-move-vercel-to-new-account)
3. [Domain Setup (Hostinger + Cloudflare Recommendation)](#3-domain-setup-hostinger--cloudflare-recommendation)
4. [Enable Resend for Live Real-Time Emails](#4-enable-resend-for-live-real-time-emails)
5. [Google OAuth Verification](#5-google-oauth-verification)
6. [Apple OAuth Verification](#6-apple-oauth-verification)
7. [Supabase Production Checklist](#7-supabase-production-checklist)
8. [Critical Pre-Launch Items Checklist](#8-critical-pre-launch-items-checklist)

---

## 1. Move GitHub Repository to New Account

### Step 1.1: Transfer Repository Ownership
1. Go to GitHub and open your repository.
2. Click **Settings** (top tab bar).
3. Scroll all the way down to the **Danger Zone** section.
4. Click **Transfer ownership**.
5. In the modal:
   - Type the **username** or **organization name** of the new GitHub account.
   - Type the repository confirmation name.
   - Click **I understand, transfer this repository**.

### Step 1.2: Accept the Transfer
1. Log in to the **new GitHub account** (or check the associated email).
2. Look for the transfer invitation email and click **Accept**.
3. All commits, pull requests, issues, and branches will seamlessly transfer without any loss.

### Step 1.3: Update Local Git Remote (On Your Computer)
In your terminal, update your local remote URL so you can push to the new account:
```powershell
git remote set-url origin https://github.com/<NEW_USERNAME>/<REPO_NAME>.git
git remote -v
```

---

## 2. Move Vercel to New Account

### Option A: Fresh Import on New Vercel Account (Recommended)
1. Log in to the **new Vercel account** (sign in via the new GitHub account).
2. On your Vercel Dashboard, click **Add New...** → **Project**.
3. Select your transferred GitHub repository from the list and click **Import**.
4. In the **Configure Project** screen:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
5. Expand **Environment Variables** and paste the following values:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wlmcektzqhlvbtnzczih.supabase.co` | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your anon public key from `.env.local`)* | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your service role key from `.env.local`)* | Server-only admin key |
| `RESEND_API_KEY` | *(Your Resend API key starting with re_... from .env.local)* | Resend API key |
| `RESEND_FROM_EMAIL` | `ChurchNavigator <notifications@churchnavigator.com>` | Active after domain verified |
| `SUPER_ADMIN_EMAILS` | `zinxs4@gmail.com` | Primary Super Admin |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` | `zinxs4@gmail.com` | Public check for admin nav |
| `NEXT_PUBLIC_APP_URL` | `https://churchnavigator.com` | Production canonical URL |
| `GOOGLE_PLACES_KEY` | *(Your Google Places API key)* | Optional for address auto-fill |

6. Click **Deploy**. Vercel will build and assign a deployment URL (`churchnavigator.vercel.app`).

---

## 3. Domain Setup (Hostinger + Cloudflare Recommendation)

### Why Use Cloudflare for DNS?
- **Speed**: Cloudflare DNS propagates in 10 seconds worldwide (Hostinger can take hours).
- **Deliverability**: Managing Resend TXT/CNAME records is reliable and error-free.
- **Security**: Free SSL, DDoS mitigation, and bot shielding.

### Step 3.1: Add Domain to Cloudflare
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and click **Add a site**.
2. Enter your domain: `churchnavigator.com`.
3. Select the **Free plan** and click **Continue**.
4. Cloudflare will scan your existing records. Click **Continue**.
5. Cloudflare will give you **2 Nameservers** (e.g., `ashley.ns.cloudflare.com` and `tom.ns.cloudflare.com`).

### Step 3.2: Update Nameservers in Hostinger
1. Log in to your [Hostinger Control Panel](https://hpanel.hostinger.com/).
2. Go to **Domains** → click **churchnavigator.com**.
3. Under the **DNS / Nameservers** tab, click **Change Nameservers**.
4. Select **Custom Nameservers** and paste the two Cloudflare nameservers.
5. Click **Save**.

### Step 3.3: Point Domain to Vercel (Inside Cloudflare DNS)
In Cloudflare → **DNS** → **Records**, add these two records:

1. **Root Domain (A Record)**:
   - **Type**: `A`
   - **Name**: `@`
   - **IPv4 address**: `76.76.21.21` (Vercel Anycast IP)
   - **Proxy status**: **DNS only (Grey cloud)** *(Important for Vercel SSL validation)*
   - **TTL**: Auto

2. **WWW Subdomain (CNAME Record)**:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: **DNS only (Grey cloud)**
   - **TTL**: Auto

### Step 3.4: Add Domain in Vercel
1. Open your project in Vercel → **Settings** → **Domains**.
2. Add `churchnavigator.com` and check the option to redirect `www.churchnavigator.com` to `churchnavigator.com`.
3. Within 2–5 minutes, Vercel will show a green checkmark and automatically issue a free Let's Encrypt SSL certificate.

---

## 4. Enable Resend for Live Real-Time Emails

Currently, Resend is restricted to sending test emails to `connect.churchnavigator@gmail.com`. To send emails to **any** visitor, church, pastor, or attendee, you must verify your custom domain.

### Step 4.1: Add Domain in Resend
1. Log in to [resend.com/domains](https://resend.com/domains) using `connect.churchnavigator@gmail.com`.
2. Click **Add Domain**.
3. Enter: `churchnavigator.com` (or `mail.churchnavigator.com` if using a dedicated subdomain).
4. Select your preferred region (e.g., `us-east-1` or `eu-west-1`).
5. Click **Add**.

### Step 4.2: Add Resend DNS Records into Cloudflare (or Hostinger)
Resend will provide **3 DNS records**:

#### 1. DKIM (DomainKeys Identified Mail)
- **Type**: `CNAME`
- **Name**: `resend._domainkey` (or the specific key generated by Resend)
- **Target**: `feedback-smtp.resend.com`
- **Proxy status**: **DNS only (Grey cloud)**

#### 2. SPF (Sender Policy Framework)
- **Type**: `TXT`
- **Name**: `@` (or `bounces`)
- **Value**: `v=spf1 include:amazonses.com ~all`

#### 3. DMARC (Email Authentication & Delivery)
- **Type**: `TXT`
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=none;`

### Step 4.3: Verify in Resend
1. In Resend, click **Verify DNS Records**.
2. Within 1–2 minutes, all three records will show green status: **Verified**.

### Step 4.4: Update Environment Variables
In your local `.env.local` and in **Vercel Project Settings → Environment Variables**, set:
```env
RESEND_FROM_EMAIL="ChurchNavigator <notifications@churchnavigator.com>"
NEXT_PUBLIC_APP_URL="https://churchnavigator.com"
```
Redeploy Vercel. Now, all contact forms, enquiries, and listing notifications will dispatch instantly to **any** real recipient worldwide!

---

## 5. Google OAuth Verification

When users click "Sign In with Google", Google requires verification so users don't see an "Unverified App" warning.

### Step 5.1: Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project and navigate to **APIs & Services** → **OAuth consent screen**.
3. Select User Type: **External** → click **Create**.
4. Fill in the App Information:
   - **App name**: `ChurchNavigator`
   - **User support email**: `connect.churchnavigator@gmail.com`
   - **App logo**: Upload `icon.png`
   - **Application home page**: `https://churchnavigator.com`
   - **Application privacy policy link**: `https://churchnavigator.com/privacy`
   - **Application terms of service link**: `https://churchnavigator.com/terms`
   - **Authorized domains**:
     - `churchnavigator.com`
     - `supabase.co`
   - **Developer contact email**: `connect.churchnavigator@gmail.com`
5. Click **Save and Continue**.

### Step 5.2: Set Scopes
1. Click **Add or Remove Scopes**.
2. Select only non-sensitive default scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
3. Click **Update** → **Save and Continue**.

### Step 5.3: Update Credentials & Redirect URIs
1. Go to **APIs & Services** → **Credentials**.
2. Click your OAuth 2.0 Web Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `https://churchnavigator.com`
   - `https://www.churchnavigator.com`
4. Under **Authorized redirect URIs**, ensure your Supabase Auth callback is present:
   - `https://wlmcektzqhlvbtnzczih.supabase.co/auth/v1/callback`
5. Click **Save**.

### Step 5.4: Publish App (Verification Request)
1. Go back to **OAuth consent screen**.
2. Under Publishing status, click **Publish App**.
3. Confirm the dialog to move from "Testing" to "In production".
   *(Because you are only requesting basic email/profile scopes, Google often approves this instantly without requiring video verification).*

---

## 6. Apple OAuth Verification

### Step 6.1: Register App ID & Services ID
1. Log in to [Apple Developer Portal](https://developer.apple.com/account).
2. Go to **Certificates, Identifiers & Profiles** → **Identifiers**.
3. Under the dropdown on the top right, select **Services IDs** → Click **+**.
   - Description: `ChurchNavigator Web Auth`
   - Identifier: `com.churchnavigator.web`
   - Click **Continue** → **Register**.

### Step 6.2: Configure Sign in with Apple
1. Click on your newly created Services ID (`com.churchnavigator.web`).
2. Check the box **Sign in with Apple** → Click **Configure**.
3. Under **Primary App ID**, select your main App ID.
4. Under **Website URLs**:
   - **Domains and Subdomains**: `churchnavigator.com` (do not include `https://`)
   - **Return URLs**:
     `https://wlmcektzqhlvbtnzczih.supabase.co/auth/v1/callback`
5. Click **Next** → **Done** → **Continue** → **Save**.

### Step 6.3: Generate Key & Connect to Supabase
1. In Apple Developer, go to **Keys** → Click **+**.
2. Key Name: `ChurchNavigator Apple Auth Key`.
3. Check **Sign in with Apple** → Click **Configure** → Select your Primary App ID.
4. Click **Save** → **Continue** → **Register**.
5. Click **Download** to download the `.p8` private key file. *(Note down the **Key ID** and your Apple **Team ID**)*.
6. Open your [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Providers** → **Apple**:
   - Turn **Enable Apple** to ON.
   - **Client ID**: `com.churchnavigator.web`
   - **Key ID**: *(Your Key ID from Apple)*
   - **Team ID**: *(Your 10-character Apple Developer Team ID)*
   - **Secret Key**: Open the `.p8` file in a text editor and copy the entire contents.
   - Click **Save**.

---

## 7. Supabase Production Checklist

### Step 7.1: Update Site URL and Redirect URLs
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → select project `wlmcektzqhlvbtnzczih`.
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL**:
   ```
   https://churchnavigator.com
   ```
4. Under **Redirect URLs**, click **Add URL** and add each of these:
   - `https://churchnavigator.com/**`
   - `https://www.churchnavigator.com/**`
   - `http://localhost:3000/**` *(Keep this so local dev continues to work)*
5. Click **Save**.

### Step 7.2: Verify Super Admin Access
Your email `zinxs4@gmail.com` has already been assigned `super_admin` in Supabase Auth. To ensure uninterrupted access after deploying to Vercel, verify that `SUPER_ADMIN_EMAILS` is set in Vercel environment variables as `zinxs4@gmail.com`.

---

## 8. Critical Pre-Launch Items Checklist

Before announcing the site publicly, verify these final items:

- [ ] **Privacy Policy & Terms Pages**:
  - Verify `https://churchnavigator.com/privacy` and `https://churchnavigator.com/terms` load properly (required by Google & Apple).
- [ ] **Email Notification Test**:
  - Test submitting a form on `/pastor/[slug]` and ensure an email is received in both the pastor inbox and visitor inbox.
- [ ] **SEO & Metadata**:
  - Confirm `robots.txt` allows indexing (`User-agent: * / Allow: /`).
  - Verify open graph cards (share a church listing link on WhatsApp or Twitter/X to check title, description, and thumbnail).
- [ ] **Google Places API**:
  - If using Google Places autocomplete for church locations, ensure the API key in Google Cloud Console is restricted to HTTP referrers: `https://churchnavigator.com/*`.

---

## Quick Reference Summary

```
Domain:                 churchnavigator.com
Hosting:                Vercel (A Record: 76.76.21.21)
DNS / CDN:              Cloudflare (DNS Only / Grey Cloud)
Auth / Database:        Supabase (Project: wlmcektzqhlvbtnzczih)
Email Engine:           Resend (notifications@churchnavigator.com)
Admin Account:          zinxs4@gmail.com
Support Email:          connect.churchnavigator@gmail.com
```
