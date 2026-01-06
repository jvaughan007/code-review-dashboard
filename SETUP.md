# Setup Instructions

Follow these steps to configure Supabase and GitHub OAuth for local development.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `code-review-dashboard`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing**: Free tier
5. Click **"Create new project"** (takes ~2 minutes)

## Step 2: Get Supabase API Keys

1. In your Supabase project, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

3. Open `.env.local` and add:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## Step 3: Create GitHub OAuth App

1. Go to [https://github.com/settings/developers](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `Code Review Dashboard (Local)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: Get this from Supabase (see Step 4)
4. Click **"Register application"**
5. On the app page:
   - Copy **Client ID**
   - Click **"Generate a new client secret"**
   - Copy **Client Secret** (save it - you won't see it again!)

## Step 4: Configure GitHub Auth in Supabase

1. In Supabase, go to **Authentication** > **Providers**
2. Find **GitHub** and click to expand
3. Enable **GitHub enabled**
4. Copy the **Callback URL** from Supabase (looks like: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`)
5. Go back to your GitHub OAuth app and **update the Authorization callback URL** with the Supabase callback URL
6. In Supabase GitHub provider settings, paste:
   - **Client ID** from GitHub
   - **Client Secret** from GitHub
7. Click **Save**

## Step 5: Add GitHub Credentials to .env.local

Open `.env.local` and add your GitHub OAuth credentials:

```bash
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Your final `.env.local` should look like:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 6: Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. You should see the home page (which will redirect to `/login` since you're not authenticated)

4. Click **"Sign in with GitHub"**

5. Authorize the app on GitHub

6. You should be redirected back to the home page, now showing your GitHub profile

7. Test logout by clicking the **Logout** button

## Troubleshooting

### "Invalid OAuth callback URL"
- Make sure the callback URL in your GitHub OAuth app matches exactly what Supabase provides
- Should be: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`

### "OAuth failed" or stuck on login
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify GitHub Client ID and Secret are correct in both `.env.local` AND Supabase dashboard

### Redirecting to /login when already logged in
- Clear your browser cookies and try again
- Check the browser console for errors

### Environment variables not loading
- Make sure the file is named `.env.local` (not `.env.local.txt`)
- Restart the dev server after adding/changing env variables
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

## Next Steps

Once authentication is working:
- ✅ You're authenticated with GitHub
- ⏭️ Next: Build GitHub API client to fetch pull requests
- ⏭️ After: Create PR listing UI and real-time collaboration features

---

**Status**: Setup in progress
**Last Updated**: 2026-01-05
