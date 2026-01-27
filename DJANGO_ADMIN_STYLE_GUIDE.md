# Django Admin Style Guide
## TopSkill LMS - Complete Design System

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Components](#components)
5. [Layout & Spacing](#layout--spacing)
6. [Interactive Elements](#interactive-elements)
7. [Status & Feedback](#status--feedback)
8. [Responsive Design](#responsive-design)
9. [Implementation Guide](#implementation-guide)
10. [File Structure](#file-structure)

---

## 1. Overview

The Django Admin interface for TopSkill LMS uses a modern, professional design system that matches the frontend branding. All colors, typography, and components are consistent with the centralized color palette defined in `frontend/lib/colors.ts`.

**Design Principles:**
- Clean and professional
- Consistent with frontend branding
- Accessible (WCAG AA compliant)
- Responsive across all devices
- Modern UI with smooth transitions

---

## 2. Color Palette

### Primary Colors

| Color | Hex Code | Usage | CSS Variable |
|-------|----------|-------|--------------|
| **Deep Teal** | `#048181` | Primary buttons, links, accents | `--primary-color` |
| **Dark Teal** | `#036969` | Hover states, gradients | `--primary-dark` |
| **Reddish Orange** | `#f45c2c` | Secondary buttons, hover states | `--secondary-color` |
| **Sage Green** | `#5a9c7d` | Secondary buttons, accents | `--accent-color` |
| **Pale Gold** | `#ecca72` | Highlights, badges | `--highlight-color` |

### Text Colors

| Color | Hex Code | Usage | CSS Variable |
|-------|----------|-------|--------------|
| **Dark Forest Green** | `#366854` | Main text, headings | `--text-dark` |
| **Muted Gray** | `#64748B` | Secondary text, help text | `--text-muted` |
| **White** | `#FFFFFF` | Text on dark backgrounds | `--text-white` |

### Background Colors

| Color | Hex Code | Usage | CSS Variable |
|-------|----------|-------|--------------|
| **White** | `#FFFFFF` | Main background, cards | `--background-primary` |
| **Pale Mint** | `#9fbeb2` | Light backgrounds, gradients | `--background-light` |
| **Light Gray** | `#F8FAFC` | Section backgrounds | `--background-secondary` |

### Border Colors

| Color | Hex Code | Usage | CSS Variable |
|-------|----------|-------|--------------|
| **Light Border** | `#CBD5E1` | Default borders | `--border-color` |
| **Dark Border** | `#334155` | Dark section borders | `--border-dark` |

### Status Colors

| Status | Hex Code | Usage | CSS Variable |
|--------|----------|-------|--------------|
| **Success** | `#048181` | Success messages, completed states | `--success-color` |
| **Error** | `#DC2626` | Error messages, validation errors | `--error-color` |
| **Warning** | `#F59E0B` | Warning messages, alerts | `--warning-color` |
| **Info** | `#048181` | Information messages | `--info-color` |

---

## 3. Typography

### Font Families
- **Primary Font:** System default (sans-serif stack)
- **Monospace:** For code, IDs, certificate numbers

### Font Sizes

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **Page Title (h1)** | `28px` | `700` | `1.2` |
| **Section Headings (h2)** | `16px` | `700` | `1.3` |
| **Subsection Headings (h3)** | `14px` | `600` | `1.4` |
| **Body Text** | `14px` | `400` | `1.5` |
| **Small Text** | `12px` | `400` | `1.4` |
| **Labels** | `14px` | `600` | `1.4` |
| **Buttons** | `14px` | `600` | `1.2` |

### Text Colors

```css
/* Main Text */
color: var(--text-dark);        /* #366854 - Headings, body text */

/* Secondary Text */
color: var(--text-muted);       /* #64748B - Help text, descriptions */

/* Links */
color: var(--primary-color);    /* #048181 - All links */

/* Links on Hover */
color: var(--secondary-color); /* #f45c2c - Hover state */
```

---

## 4. Components

### 4.1 Header

**Location:** Top of every admin page

**Styling:**
```css
#header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    border-bottom: 3px solid var(--secondary-color);
    box-shadow: 0 4px 12px rgba(4, 129, 129, 0.15);
    padding: 0;
}
```

**Branding:**
- Logo: TopSkill logo from `https://topskills.pk/wp-content/uploads/2024/08/Group-27515-2048x623.png`
- Logo height: `32px` (main pages), `40px` (login page)
- Title: "Admin Panel" in white, bold
- Title color: `#FFFFFF`
- Title size: `20px` (main), `24px` (login)

---

### 4.2 Login Page

**Background:**
```css
background: linear-gradient(135deg, #9fbeb2 0%, #FFFFFF 100%);
```

**Login Card:**
- Background: `#FFFFFF`
- Border radius: `16px`
- Box shadow: `0 20px 60px rgba(0, 35, 90, 0.15)`
- Padding: `40px`
- Max width: `420px`

**Form Inputs:**
- Border: `2px solid #CBD5E1`
- Border radius: `8px`
- Padding: `12px 16px`
- Focus border: `2px solid #048181`
- Focus shadow: `0 0 0 3px rgba(4, 129, 129, 0.1)`

**Login Button:**
- Background: `#048181`
- Hover background: `#f45c2c`
- Color: `#FFFFFF`
- Padding: `14px 24px`
- Border radius: `8px`
- Font weight: `700`
- Box shadow: `0 4px 12px rgba(4, 129, 129, 0.3)`
- Hover shadow: `0 6px 20px rgba(244, 92, 44, 0.4)`
- Hover transform: `translateY(-2px)`

---

### 4.3 Buttons

**Primary Button:**
```css
background: var(--primary-color);      /* #048181 */
color: var(--text-white);               /* #FFFFFF */
border: none;
padding: 12px 24px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(4, 129, 129, 0.3);
transition: all 0.3s ease;
```

**Primary Button Hover:**
```css
background: var(--secondary-color);     /* #f45c2c */
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(244, 92, 44, 0.4);
```

**Secondary Button:**
- Use `--accent-color` (`#5a9c7d`) for secondary actions

---

### 4.4 Forms

**Form Fields:**
```css
input[type="text"],
input[type="email"],
input[type="number"],
input[type="url"],
input[type="date"],
textarea,
select {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid var(--border-color);    /* #CBD5E1 */
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
}
```

**Form Fields Focus:**
```css
border-color: var(--primary-color);           /* #048181 */
box-shadow: 0 0 0 3px rgba(4, 129, 129, 0.1);
```

**Form Labels:**
```css
color: var(--text-dark);                      /* #366854 */
font-weight: 600;
font-size: 14px;
margin-bottom: 8px;
```

**Help Text:**
```css
color: var(--text-muted);                     /* #64748B */
font-size: 12px;
font-style: italic;
```

---

### 4.5 Cards & Modules

**Dashboard Modules:**
```css
background: white;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
border: 1px solid var(--border-color);
padding: 20px;
transition: all 0.3s ease;
```

**Module Header:**
```css
background: var(--primary-color);              /* #048181 */
color: white;
padding: 16px 20px;
font-size: 16px;
font-weight: 700;
```

**Module Hover:**
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
transform: translateY(-2px);
```

---

### 4.6 Tables

**Table Header:**
```css
background: #F8FAFC;
color: var(--text-dark);                      /* #366854 */
font-weight: 600;
padding: 14px;
border-bottom: 2px solid var(--border-color);
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.5px;
```

**Table Rows:**
```css
border-bottom: 1px solid var(--border-color);
transition: background 0.2s ease;
```

**Table Row Hover:**
```css
background: #F8FAFC;
```

**Table Links:**
```css
color: var(--primary-color);                  /* #048181 */
text-decoration: none;
font-weight: 500;
```

**Table Links Hover:**
```css
text-decoration: underline;
```

---

### 4.7 Breadcrumbs

**Breadcrumb Container:**
```css
background: #F8FAFC;
border-bottom: 1px solid var(--border-color);
padding: 12px 20px;
font-size: 13px;
```

**Breadcrumb Links:**
```css
color: var(--primary-color);                  /* #048181 */
text-decoration: none;
font-weight: 500;
```

**Breadcrumb Links Hover:**
```css
text-decoration: underline;
```

---

### 4.8 Filters Sidebar

**Filter Container:**
```css
background: #F8FAFC;
border-right: 2px solid var(--border-color);
padding: 20px;
```

**Filter Headings:**
```css
color: var(--text-dark);                      /* #366854 */
font-size: 14px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.5px;
border-bottom: 2px solid var(--primary-color);
padding-bottom: 8px;
margin-bottom: 16px;
```

**Filter Links:**
```css
color: var(--text-muted);                     /* #64748B */
text-decoration: none;
display: block;
padding: 6px 0;
transition: color 0.3s ease;
```

**Filter Links Hover/Selected:**
```css
color: var(--primary-color);                  /* #048181 */
font-weight: 600;
```

---

## 5. Layout & Spacing

### Content Area

**Main Content:**
```css
padding: 30px;
background: #F8FAFC;
min-height: calc(100vh - 120px);
```

**Page Title:**
```css
color: var(--text-dark);                      /* #366854 */
font-weight: 700;
font-size: 28px;
margin-bottom: 24px;
padding-bottom: 12px;
border-bottom: 3px solid var(--primary-color);
```

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| **XS** | `4px` | Tight spacing |
| **S** | `8px` | Small gaps |
| **M** | `12px` | Default spacing |
| **L** | `16px` | Medium spacing |
| **XL** | `20px` | Large spacing |
| **XXL** | `24px` | Section spacing |
| **XXXL** | `30px` | Page spacing |

---

## 6. Interactive Elements

### Links

**Default Link:**
```css
color: var(--primary-color);                  /* #048181 */
text-decoration: none;
font-weight: 500;
```

**Link Hover:**
```css
color: var(--secondary-color);                /* #f45c2c */
text-decoration: underline;
```

### Buttons

**Button States:**
- **Default:** `#048181` background
- **Hover:** `#f45c2c` background, `translateY(-2px)`
- **Active:** Slightly darker shade
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`

### Form Inputs

**Input States:**
- **Default:** `#CBD5E1` border
- **Focus:** `#048181` border, shadow ring
- **Error:** `#DC2626` border
- **Disabled:** Gray background, `cursor: not-allowed`

---

## 7. Status & Feedback

### Success Messages

```css
background: #D1FAE5;
color: #065F46;
border-left: 4px solid var(--success-color);  /* #048181 */
padding: 14px 20px;
border-radius: 8px;
font-weight: 500;
```

### Error Messages

```css
background: #FEE2E2;
color: #991B1B;
border-left: 4px solid var(--error-color);    /* #DC2626 */
padding: 14px 20px;
border-radius: 8px;
font-weight: 500;
```

### Warning Messages

```css
background: #FEF3C7;
color: #92400E;
border-left: 4px solid var(--warning-color); /* #F59E0B */
padding: 14px 20px;
border-radius: 8px;
font-weight: 500;
```

### Info Messages

```css
background: #DBEAFE;
color: #1E40AF;
border-left: 4px solid var(--info-color);     /* #048181 */
padding: 14px 20px;
border-radius: 8px;
font-weight: 500;
```

### Error Lists (Form Validation)

```css
background: #FEE2E2;
color: var(--error-color);                    /* #DC2626 */
border: 1px solid #FCA5A5;
border-radius: 8px;
padding: 12px 16px;
list-style: none;
```

---

## 8. Responsive Design

### Breakpoints

| Device | Max Width | Adjustments |
|--------|-----------|-------------|
| **Mobile** | `768px` | Reduced padding, hidden filters, stacked layout |
| **Tablet** | `1024px` | Adjusted spacing, smaller fonts |
| **Desktop** | `1024px+` | Full layout |

### Mobile Styles

```css
@media (max-width: 768px) {
    #content {
        padding: 20px;
    }
    
    .dashboard .module {
        margin-bottom: 15px;
    }
    
    #changelist-filter {
        display: none;  /* Hide filters on mobile */
    }
    
    #changelist-search input[type="text"] {
        width: 100%;
    }
}
```

---

## 9. Implementation Guide

### 9.1 File Locations

**Templates:**
- `backend/lms/templates/admin/base_site.html` - Base admin template
- `backend/lms/templates/admin/login.html` - Login page template

**Stylesheets:**
- `backend/lms/static/admin/css/custom_admin.css` - Main admin styles

### 9.2 CSS Variables

All colors are defined as CSS variables in `custom_admin.css`:

```css
:root {
    --primary-color: #048181;
    --secondary-color: #f45c2c;
    --text-dark: #366854;
    --text-muted: #64748B;
    /* ... etc */
}
```

**Usage:**
```css
.my-element {
    color: var(--primary-color);
    background: var(--background-primary);
    border: 1px solid var(--border-color);
}
```

### 9.3 Updating Colors

To update the color scheme:

1. **Update CSS Variables** in `backend/lms/static/admin/css/custom_admin.css`
2. **Update Frontend Colors** in `frontend/lib/colors.ts` (for consistency)
3. **Clear Browser Cache** to see changes immediately
4. **Test All Pages** to ensure consistency

### 9.4 Logo Updates

**To update the logo:**

1. **Base Site Template** (`base_site.html`):
   ```html
   <img src="YOUR_LOGO_URL" 
        alt="TopSkill" 
        style="height: 32px; width: auto; max-width: 150px;" />
   ```

2. **Login Template** (`login.html`):
   ```html
   <img src="YOUR_LOGO_URL" 
        alt="TopSkill" 
        style="height: 40px; width: auto; max-width: 180px;" />
   ```

**Current Logo:**
- URL: `https://topskills.pk/wp-content/uploads/2024/08/Group-27515-2048x623.png`
- Height: `32px` (main), `40px` (login)
- Max width: `150px` (main), `180px` (login)

---

## 10. File Structure

```
backend/
├── lms/
│   ├── templates/
│   │   └── admin/
│   │       ├── base_site.html          # Base admin template
│   │       └── login.html              # Login page template
│   └── static/
│       └── admin/
│           └── css/
│               └── custom_admin.css     # Main admin stylesheet
```

---

## 11. Component Examples

### 11.1 Dashboard Module

```html
<div class="module">
    <h2>Recent Courses</h2>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><a href="#">Course Name</a></td>
                <td>Active</td>
            </tr>
        </tbody>
    </table>
</div>
```

### 11.2 Form Field

```html
<div class="form-row">
    <label for="id_title">Title:</label>
    <input type="text" name="title" id="id_title" required>
    <p class="help">Enter the course title</p>
</div>
```

### 11.3 Button

```html
<input type="submit" value="Save" class="default">
<button type="button">Cancel</button>
```

### 11.4 Message

```html
<ul class="messagelist">
    <li class="success">Course saved successfully!</li>
</ul>
```

---

## 12. Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:

- **Text on White:** `#366854` on `#FFFFFF` = 7.2:1 ✅
- **Text on Teal:** `#FFFFFF` on `#048181` = 4.5:1 ✅
- **Links:** `#048181` on `#FFFFFF` = 4.5:1 ✅

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are visible (shadow ring)
- Tab order is logical

### Screen Readers

- All images have alt text
- Form labels are properly associated
- ARIA labels where needed

---

## 13. Best Practices

### Do's ✅

- Use CSS variables for all colors
- Maintain consistent spacing
- Use semantic HTML
- Test on multiple browsers
- Ensure accessibility compliance
- Keep styles organized and commented

### Don'ts ❌

- Don't use inline styles (except in templates where necessary)
- Don't hardcode color values
- Don't override Django admin core styles unnecessarily
- Don't break responsive layout
- Don't use colors that don't meet contrast requirements

---

## 14. Troubleshooting

### Styles Not Applying

1. **Clear browser cache:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Check file path:** Ensure `custom_admin.css` is in `static/admin/css/`
3. **Run collectstatic:** `python manage.py collectstatic`
4. **Check template:** Ensure `{% load static %}` is present

### Logo Not Showing

1. **Check URL:** Verify logo URL is accessible
2. **Check dimensions:** Ensure height/width are set correctly
3. **Check alt text:** Ensure alt attribute is present

### Colors Not Matching

1. **Check CSS variables:** Ensure all variables are defined
2. **Check frontend colors:** Ensure `frontend/lib/colors.ts` matches
3. **Clear cache:** Browser cache may be serving old styles

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial TopSkill branding, updated from PureLogics |
| 1.1 | 2024 | Centralized color palette, updated logo |

---

## 16. Resources

- **Frontend Color Palette:** `frontend/lib/colors.ts`
- **Django Admin Docs:** https://docs.djangoproject.com/en/stable/ref/contrib/admin/
- **TopSkill Website:** https://topskills.pk/
- **Logo URL:** https://topskills.pk/wp-content/uploads/2024/08/Group-27515-2048x623.png

---

**Document Version:** 1.1  
**Last Updated:** 2024  
**System:** TopSkill LMS Django Admin

