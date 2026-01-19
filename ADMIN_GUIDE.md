# Django Admin Guide - Udemy-like Course Management

## 🎯 Quick Start

1. **Login to Admin:** http://localhost:8000/admin/
   - Username: `adeel.haider` or `admin`
   - Password: `purelogics` or `admin123`

2. **Create a Course:**
   - Go to **Courses** → **Add Course**
   - Fill in basic information (title, description, price, instructor)
   - Scroll down to **Course Sections** section
   - Click **"Add another Course Section"** to add sections
   - Save the course

3. **Add Sections and Lectures:**
   - Go to **Course Sections** in the admin menu
   - Click **"Add Course Section"**
   - Select the course, enter section title and order
   - Scroll down to **Lectures** section
   - Click **"Add another Lecture"** to add lectures
   - For each lecture:
     - Enter title (e.g., "Introduction to Python")
     - Enter YouTube Video ID (e.g., "rfscVS0vtbw")
     - Enter duration in minutes (e.g., 25 for 25 minutes, 90 for 1 hour 30 minutes)
     - Check "Is preview" if you want non-enrolled users to see it
   - Save the section

## 📹 Adding Videos

### YouTube Videos (Recommended)
1. Set **Video type** to "YouTube"
2. Enter **YouTube Video ID** (not the full URL)
   - Example: If video URL is `https://www.youtube.com/watch?v=rfscVS0vtbw`
   - Enter only: `rfscVS0vtbw`
3. Enter **Duration in minutes**
   - Example: 25 for 25 minutes
   - Example: 90 for 1 hour 30 minutes
   - Example: 68 for 1 hour 8 minutes (as shown in video player)

### Direct Video URLs
1. Set **Video type** to "Direct URL"
2. Enter the full video URL in **Content URL** field
3. Enter duration in minutes

## ⏱️ Video Duration

**Important:** The duration you enter should match the actual video length!

- If video shows "0:07 / 1:08:30" in player, the video is **68 minutes** (1 hour 8 minutes)
- Enter: `68` in the duration_minutes field
- Total course duration is **automatically calculated** from all lecture durations

## 📊 Course Statistics (Auto-calculated)

The following statistics are **automatically calculated** when you save courses/sections/lectures:

- **Total Lectures:** Count of all lectures in the course
- **Total Duration:** Sum of all lecture durations (in hours)
- **Total Sections:** Count of all sections

These update automatically when you:
- Add/edit/delete sections
- Add/edit/delete lectures
- Change lecture durations

## 🎓 Step-by-Step: Creating a Complete Course

### Step 1: Create the Course
1. Go to **Courses** → **Add Course**
2. Fill in:
   - Title: "Complete Python Course"
   - Description: Full course description
   - Short description: Brief description for course cards
   - Price: 99.99
   - Instructor: Select instructor
   - Level: Beginner/Intermediate/Advanced
   - Categories: Select relevant categories
   - Tags: Select relevant tags
3. Click **Save**

### Step 2: Add Sections
1. Go to **Course Sections** → **Add Course Section**
2. Select your course
3. Enter:
   - Title: "Introduction to Python"
   - Order: 1
   - Is preview: Check if you want this section to be previewable
4. Scroll down to **Lectures** section
5. Click **"Add another Lecture"**

### Step 3: Add Lectures
For each lecture:
1. Enter:
   - Title: "What is Python?"
   - Order: 1
   - Description: Lecture description
   - Video type: YouTube
   - YouTube video ID: `rfscVS0vtbw` (example)
   - Duration (minutes): `15` (enter actual video length)
   - Is preview: Check for first lecture if you want preview
2. Click **Save**

### Step 4: Verify
1. Go back to your Course
2. Check **Statistics** section - it should show:
   - Total Lectures: (auto-calculated)
   - Total Duration: (auto-calculated in hours)

## 🔧 Admin Features

### Course Admin
- **List View:** Shows all courses with duration and lecture count
- **Inline Sections:** Add sections directly when editing course
- **Auto-calculated Stats:** Duration and lecture count update automatically

### Section Admin
- **List View:** Shows sections with lecture count and duration
- **Inline Lectures:** Add lectures directly when editing section
- **Course Link:** Click course name to go to course admin

### Lecture Admin
- **List View:** Shows all lectures with video info and duration
- **Video Display:** Shows clickable YouTube links
- **Duration Display:** Shows duration in readable format (e.g., "1h 30m")
- **Auto-updates:** Course stats update when you save lectures

## 📝 Best Practices

1. **Use Real Video Lengths:** Enter the actual video duration, not estimated
2. **Descriptive Titles:** Use clear, descriptive lecture titles (not "Lecture 1.1")
3. **Preview Content:** Mark first 1-2 lectures as preview for marketing
4. **Organize Sections:** Use logical section titles and ordering
5. **Check Stats:** Always verify auto-calculated stats after adding content

## 🎬 Example: Adding a 1 hour 8 minute video

If your video is 1 hour 8 minutes (shown as "1:08:30" in player):
1. Calculate: 1 hour = 60 minutes, 8 minutes = 8 minutes
2. Total: 60 + 8 = **68 minutes**
3. Enter `68` in the **Duration (minutes)** field

## ✅ Verification Checklist

After creating a course, verify:
- [ ] All sections have proper titles
- [ ] All lectures have descriptive titles (not generic)
- [ ] All videos have YouTube IDs or URLs
- [ ] All videos have correct durations (matching actual video length)
- [ ] Course statistics show correct totals
- [ ] Preview lectures are marked correctly
- [ ] Course is active and visible

## 🆘 Troubleshooting

**Videos not showing in course player:**
- Check that YouTube Video ID is correct (not full URL)
- Verify video is not private or restricted
- Check that lecture has `youtube_video_id` or `content_url` set

**Duration not calculating:**
- Make sure all lectures have `duration_minutes` set
- Save the course again to trigger auto-calculation
- Check Course Sections admin to see individual lecture durations

**Stats not updating:**
- Save the course, section, or lecture again
- Check that lectures are properly linked to sections
- Verify sections are linked to the course






























