# Author Guide - Sanity CMS

This guide explains how to manage content for your portfolio website using Sanity CMS.

---

## 🚀 One-Time Setup (Required)

### Step 1: Create Sanity Account & Project

1. Go to [sanity.io](https://www.sanity.io/) and sign up (free)
2. Create a new project:
   - Name: `portfolio`
   - Dataset: `production`
3. Note your **Project ID** (found in project settings)

### Step 2: Add Environment Variables to Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |

Click **Save** and **Redeploy** your site.

### Step 3: Configure CORS

In Sanity Dashboard:
1. Go to **API → CORS origins**
2. Add `https://amodit.space` (your domain)
3. Add `http://localhost:3000` (for local dev)

---

## ✍️ Daily Content Management

### Accessing the CMS

**Option A: Sanity Studio (Recommended)**
- Go to: `https://your-project-name.sanity.studio`
- Login with Google or GitHub

**Option B: Embedded Studio**
- Go to: `https://amodit.space/studio`
- Login with the same credentials

---

## 📝 Writing Blog Posts

1. In Sanity Studio, click **Blog Post** → **Create**
2. Fill in:
   - **Title**: Your post title
   - **Slug**: Click "Generate" (or customize)
   - **Published At**: Set the date
   - **Excerpt**: Short summary for previews
   - **Cover Image**: Upload an image
   - **Body**: Write your content with rich text
   - **Draft**: Toggle OFF to publish
3. Click **Publish**

**Your post appears on amodit.space within ~60 seconds.**

---

## 🚀 Managing Projects

1. Click **Project** → **Create**
2. Fill in:
   - **Title**: Project name
   - **Description**: What it does
   - **Tags**: Add technology tags (Python, React, etc.)
   - **Thumbnail**: Project screenshot or logo
   - **GitHub URL**: Link to repository
   - **Demo URL**: Live demo link
   - **Paper URL**: Optional research paper
   - **Featured**: Toggle ON to highlight
   - **Display Order**: Lower numbers appear first
3. Click **Publish**

---

## 👤 Editing About Page

1. Click **About Page** (there's only one)
2. Edit:
   - **Title**: Page heading
   - **Profile Image**: Your photo
   - **Biography**: Rich text about yourself
   - **Skills**: Add categories and skill items
   - **Experience**: Add work history entries
3. Click **Publish**

---

## 📸 Uploading Images

1. In any image field, click **Upload**
2. Drag & drop or select files
3. Use the hotspot tool to set focus area
4. Images are automatically optimized by Sanity CDN

---

## 📊 Content States

| State | Meaning |
|-------|---------|
| **Draft** | Only visible in Sanity Studio |
| **Published** | Live on your website |

Toggle the **Draft** field to control visibility.

---

## ⏱️ When Changes Appear

| Content Type | Update Time |
|--------------|-------------|
| Blog Posts | ~60 seconds |
| Projects | ~60 seconds |
| About Page | ~1 hour |

No manual redeploy needed. ISR handles it automatically.

---

## ⚠️ Things to Avoid

- ❌ Don't delete the About Page document (it's a singleton)
- ❌ Don't change slugs of published posts (breaks existing links)
- ❌ Don't upload extremely large images (>5MB) - compress first

---

## 🛠️ Troubleshooting

**Changes not appearing?**
- Wait 60 seconds for ISR refresh
- Hard refresh browser (Ctrl+Shift+R)
- Check if content is published (not draft)

**Images not loading?**
- Verify CORS is configured for your domain
- Check the image was fully uploaded

**Can't access Studio?**
- Clear browser cookies
- Try incognito mode
- Re-login to Sanity

---

## 📞 Support

For CMS issues: [sanity.io/docs](https://www.sanity.io/docs)

For website issues: Check the repository README or open a GitHub issue.
