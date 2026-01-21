# Author Guide: Managing Your Portfolio

This guide explains how to update content on your portfolio website without touching any code.

## 📱 Quick Access

- **Your site**: https://amodit.space (or your custom domain)
- **Admin panel**: https://amodit.space/admin

---

## 🔐 Logging In

1. Go to `/admin` on your website
2. Click "Login with Netlify Identity" (or your auth provider)
3. Enter your email and password
4. You'll see the Content Manager dashboard

**First time?** Check your email for an invitation to set up your account.

---

## ✍️ Writing Blog Posts

### Creating a New Post

1. In the admin panel, click **Blog Posts** in the sidebar
2. Click the **New Blog Posts** button
3. Fill in the fields:
   - **Title**: The headline of your post
   - **Publish Date**: When the post was written
   - **Thumbnail**: Optional cover image (click to upload)
   - **Excerpt**: 1-2 sentences shown in the blog listing
   - **Body**: Your full article (supports Markdown)
   - **Draft**: Toggle ON to hide from public, OFF to publish

4. Click **Save** to save as draft
5. When ready to publish:
   - Set **Draft** to OFF
   - Click **Publish**

### Editing Existing Posts

1. Go to **Blog Posts** in the sidebar
2. Click on the post you want to edit
3. Make your changes
4. Click **Save** then **Publish**

### Writing Tips

The body supports **Markdown** formatting:

```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

![Image caption](/uploads/image.jpg)

`inline code` and:

​```python
# Code block
print("Hello!")
​```
```

---

## 🚀 Adding Projects

### Creating a New Project

1. Click **Projects** in the sidebar
2. Click **New Projects**
3. Fill in:
   - **Title**: Project name
   - **Description**: Brief explanation (2-3 sentences)
   - **Thumbnail**: Screenshot or logo
   - **Tags**: Technologies used (press Enter after each)
   - **GitHub URL**: Link to source code
   - **Demo URL**: Link to live demo
   - **Paper URL**: Link to research paper (if applicable)
   - **Featured**: Toggle ON to show prominently
   - **Display Order**: Lower numbers appear first
   - **Body**: Optional detailed description

4. Click **Save** then **Publish**

### Reordering Projects

Change the **Display Order** number:
- Lower numbers (1, 2, 3) appear first
- Featured projects always appear before non-featured

---

## 🖼️ Uploading Images

### During Content Creation

1. Click on any image field
2. Click **Choose an image** or drag-and-drop
3. Select your image file
4. The image uploads automatically

### Best Practices

- **Blog thumbnails**: 1200x630px (social media friendly)
- **Project thumbnails**: 800x600px minimum
- **Format**: JPG for photos, PNG for graphics
- **File size**: Keep under 500KB for fast loading

### Where Images Are Stored

Uploaded images go to:
- Blog images: `/uploads/blog/`
- Project images: `/uploads/projects/`

---

## 🔊 Audio Toggle

Your portfolio has ambient background music that visitors can control:

- **Default**: Audio is muted when visitors arrive
- **Location**: Bottom-right corner of the screen
- **Icons**: 
  - 🔊 = Audio playing (click to mute)
  - 🔇 = Audio muted (click to play)

The audio file is located at `/public/audio/`. To change it:
1. Replace the MP3 file in that folder
2. Keep the same filename, or update `AudioPlayer.tsx`

---

## 📅 Publishing Workflow

### Draft vs Published

| Status | Visible to Public? |
|--------|-------------------|
| Draft ON | No (only you see it in admin) |
| Draft OFF + Saved | No (changes saved locally) |
| Draft OFF + Published | Yes (live on site) |

### Steps to Publish

1. Create/edit content
2. Set **Draft** to OFF
3. Click **Save**
4. Click **Publish** button (top right)
5. Add a commit message (e.g., "Add new blog post")
6. Click **Publish**

The site automatically rebuilds in ~1-2 minutes.

---

## ⚠️ Troubleshooting

### "I can't log in"

- Check if you received an invitation email
- Try "Forgot password" to reset
- Make sure you're using the correct email

### "My changes aren't showing"

- Did you click **Publish** (not just Save)?
- Wait 2-3 minutes for the site to rebuild
- Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### "Image won't upload"

- Check file size (max 10MB recommended)
- Use JPG, PNG, or WebP format
- Try a different browser

### "Something looks broken"

- Take a screenshot
- Note what you were doing
- Contact your developer with details

---

## 🆘 Need Help?

If something isn't working:

1. Check this guide first
2. Try refreshing the admin panel
3. For technical issues, contact your developer

---

## 📚 Quick Reference

| Task | Where | Button |
|------|-------|--------|
| New blog post | Blog Posts | New Blog Posts |
| New project | Projects | New Projects |
| Edit content | Click any item | Edit fields, Save |
| Publish | Top of editor | Publish |
| Upload image | Image field | Choose an image |
| Delete item | Bottom of editor | Delete |

Happy publishing! 🎉
