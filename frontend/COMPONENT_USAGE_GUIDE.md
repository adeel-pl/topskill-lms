# Reusable Components & Color System Guide

## ✅ Reusable Components Available

All portals (Admin, Student) should use these reusable components:

### 1. **Button** (`/app/components/ui/button.tsx`)
```tsx
import { Button } from '@/app/components/ui/button';

<Button variant="default" size="lg">Click Me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="light">Light</Button>
```

**Variants:**
- `default` - Primary button (#048181)
- `secondary` - Secondary button (#f45c2c)
- `outline` - Outlined button
- `ghost` - Transparent button
- `light` - Light button with border

**Sizes:**
- `sm`, `default`, `lg`, `icon`

### 2. **Card** (`/app/components/ui/card.tsx`)
```tsx
import { Card } from '@/app/components/ui/card';

<Card variant="default">Content</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined" hover={true}>Hoverable</Card>
```

**Variants:**
- `default` - Standard card with shadow
- `elevated` - Elevated shadow
- `outlined` - Border only

### 3. **Heading** (`/app/components/ui/heading.tsx`)
```tsx
import { Heading } from '@/app/components/ui/heading';

<Heading as="h1" size="h1">Title</Heading>
<Heading as="h2" size="display">Display</Heading>
```

**Sizes:**
- `display`, `display-sm`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### 4. **Text** (`/app/components/ui/text.tsx`)
```tsx
import { Text } from '@/app/components/ui/text';

<Text variant="default">Default text</Text>
<Text variant="muted">Muted text</Text>
<Text variant="light">Light text</Text>
<Text variant="secondary">Secondary text</Text>
```

**Variants:**
- `default` - Primary text (#1F2937)
- `muted` - Muted text (#6B7280)
- `light` - Light text (#9CA3AF)
- `secondary` - Secondary text (#4B5563)

**Sizes:**
- `lg`, `default`, `sm`, `xs`

### 5. **FormInput** (`/app/components/ui/form-input.tsx`)
```tsx
import { FormInput } from '@/app/components/ui/form-input';

<FormInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={<FiMail />}
  error="Error message"
/>
```

### 6. **Container** (`/app/components/ui/container.tsx`)
```tsx
import { Container } from '@/app/components/ui/container';

<Container size="2xl">Content</Container>
```

### 7. **Section** (`/app/components/ui/section.tsx`)
```tsx
import { Section } from '@/app/components/ui/section';

<Section variant="soft" padding="lg">Content</Section>
```

## 🎨 Color System (`/lib/colors.ts`)

**ALWAYS use colors from `colors.ts`, NEVER hardcode colors!**

```tsx
import { colors } from '@/lib/colors';

// Primary colors
colors.primary          // #048181 (teal)
colors.secondary        // #f45c2c (orange)
colors.accentColor      // #5a9c7d (sage green)
colors.highlight        // #ecca72 (pale gold)

// Text colors
colors.text.dark        // #1F2937
colors.text.muted       // #6B7280
colors.text.light       // #9CA3AF

// Background colors
colors.background.primary  // #FFFFFF
colors.background.soft     // #F9FAFB
colors.background.dark     // #0F172A (for admin dark theme)

// Border colors
colors.border.primary   // #E5E7EB
colors.border.dark      // #334155 (for admin dark theme)

// Status colors
colors.status.success   // #10B981
colors.status.warning   // #F59E0B
colors.status.error     // #EF4444
colors.status.info      // #3B82F6
```

## ✅ Portal Status

### Student Portal (`/app/dashboard/*`)
- ✅ **ALL pages use reusable components**
- ✅ **ALL pages use colors from colors.ts**
- Pages: my-courses, purchase-history, certifications, wishlist, account

### Admin Portal (`/app/admin/*`)
- ✅ **ALL pages now use reusable components**
- ✅ **ALL pages use colors from colors.ts**
- Pages: main, analytics, courses, students, payments, settings

### Instructor Portal
- ⚠️ **Backend Django templates** (ignored as requested)
- Frontend instructor listing pages use reusable components

## 📋 Usage Checklist

When creating/updating pages:

- [ ] Import reusable components (Button, Card, Heading, Text, FormInput)
- [ ] Import colors from `@/lib/colors`
- [ ] Use `<Button>` instead of `<button>` with inline styles
- [ ] Use `<Card>` instead of `<div>` with hardcoded styles
- [ ] Use `<Heading>` instead of `<h1>`, `<h2>`, etc.
- [ ] Use `<Text>` instead of `<p>` with hardcoded colors
- [ ] Use `colors.primary`, `colors.secondary` instead of `#048181`, `#f45c2c`
- [ ] Use `colors.text.dark`, `colors.text.muted` instead of hardcoded grays
- [ ] Use `colors.border.primary` instead of hardcoded borders
- [ ] NO hardcoded hex colors (#048181, #f45c2c, etc.)
- [ ] NO hardcoded Tailwind gray classes (text-gray-900, bg-gray-100, etc.)

## 🚫 What NOT to Do

❌ **DON'T:**
```tsx
<button className="bg-[#048181] text-white">Click</button>
<div className="bg-[#0F172A] border border-[#334155]">Card</div>
<h1 className="text-[#1F2937]">Title</h1>
<p className="text-[#6B7280]">Text</p>
```

✅ **DO:**
```tsx
<Button variant="default">Click</Button>
<Card variant="outlined" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
<Heading as="h1" size="h1">Title</Heading>
<Text variant="muted">Text</Text>
```





## ✅ Reusable Components Available

All portals (Admin, Student) should use these reusable components:

### 1. **Button** (`/app/components/ui/button.tsx`)
```tsx
import { Button } from '@/app/components/ui/button';

<Button variant="default" size="lg">Click Me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="light">Light</Button>
```

**Variants:**
- `default` - Primary button (#048181)
- `secondary` - Secondary button (#f45c2c)
- `outline` - Outlined button
- `ghost` - Transparent button
- `light` - Light button with border

**Sizes:**
- `sm`, `default`, `lg`, `icon`

### 2. **Card** (`/app/components/ui/card.tsx`)
```tsx
import { Card } from '@/app/components/ui/card';

<Card variant="default">Content</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined" hover={true}>Hoverable</Card>
```

**Variants:**
- `default` - Standard card with shadow
- `elevated` - Elevated shadow
- `outlined` - Border only

### 3. **Heading** (`/app/components/ui/heading.tsx`)
```tsx
import { Heading } from '@/app/components/ui/heading';

<Heading as="h1" size="h1">Title</Heading>
<Heading as="h2" size="display">Display</Heading>
```

**Sizes:**
- `display`, `display-sm`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### 4. **Text** (`/app/components/ui/text.tsx`)
```tsx
import { Text } from '@/app/components/ui/text';

<Text variant="default">Default text</Text>
<Text variant="muted">Muted text</Text>
<Text variant="light">Light text</Text>
<Text variant="secondary">Secondary text</Text>
```

**Variants:**
- `default` - Primary text (#1F2937)
- `muted` - Muted text (#6B7280)
- `light` - Light text (#9CA3AF)
- `secondary` - Secondary text (#4B5563)

**Sizes:**
- `lg`, `default`, `sm`, `xs`

### 5. **FormInput** (`/app/components/ui/form-input.tsx`)
```tsx
import { FormInput } from '@/app/components/ui/form-input';

<FormInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={<FiMail />}
  error="Error message"
/>
```

### 6. **Container** (`/app/components/ui/container.tsx`)
```tsx
import { Container } from '@/app/components/ui/container';

<Container size="2xl">Content</Container>
```

### 7. **Section** (`/app/components/ui/section.tsx`)
```tsx
import { Section } from '@/app/components/ui/section';

<Section variant="soft" padding="lg">Content</Section>
```

## 🎨 Color System (`/lib/colors.ts`)

**ALWAYS use colors from `colors.ts`, NEVER hardcode colors!**

```tsx
import { colors } from '@/lib/colors';

// Primary colors
colors.primary          // #048181 (teal)
colors.secondary        // #f45c2c (orange)
colors.accentColor      // #5a9c7d (sage green)
colors.highlight        // #ecca72 (pale gold)

// Text colors
colors.text.dark        // #1F2937
colors.text.muted       // #6B7280
colors.text.light       // #9CA3AF

// Background colors
colors.background.primary  // #FFFFFF
colors.background.soft     // #F9FAFB
colors.background.dark     // #0F172A (for admin dark theme)

// Border colors
colors.border.primary   // #E5E7EB
colors.border.dark      // #334155 (for admin dark theme)

// Status colors
colors.status.success   // #10B981
colors.status.warning   // #F59E0B
colors.status.error     // #EF4444
colors.status.info      // #3B82F6
```

## ✅ Portal Status

### Student Portal (`/app/dashboard/*`)
- ✅ **ALL pages use reusable components**
- ✅ **ALL pages use colors from colors.ts**
- Pages: my-courses, purchase-history, certifications, wishlist, account

### Admin Portal (`/app/admin/*`)
- ✅ **ALL pages now use reusable components**
- ✅ **ALL pages use colors from colors.ts**
- Pages: main, analytics, courses, students, payments, settings

### Instructor Portal
- ⚠️ **Backend Django templates** (ignored as requested)
- Frontend instructor listing pages use reusable components

## 📋 Usage Checklist

When creating/updating pages:

- [ ] Import reusable components (Button, Card, Heading, Text, FormInput)
- [ ] Import colors from `@/lib/colors`
- [ ] Use `<Button>` instead of `<button>` with inline styles
- [ ] Use `<Card>` instead of `<div>` with hardcoded styles
- [ ] Use `<Heading>` instead of `<h1>`, `<h2>`, etc.
- [ ] Use `<Text>` instead of `<p>` with hardcoded colors
- [ ] Use `colors.primary`, `colors.secondary` instead of `#048181`, `#f45c2c`
- [ ] Use `colors.text.dark`, `colors.text.muted` instead of hardcoded grays
- [ ] Use `colors.border.primary` instead of hardcoded borders
- [ ] NO hardcoded hex colors (#048181, #f45c2c, etc.)
- [ ] NO hardcoded Tailwind gray classes (text-gray-900, bg-gray-100, etc.)

## 🚫 What NOT to Do

❌ **DON'T:**
```tsx
<button className="bg-[#048181] text-white">Click</button>
<div className="bg-[#0F172A] border border-[#334155]">Card</div>
<h1 className="text-[#1F2937]">Title</h1>
<p className="text-[#6B7280]">Text</p>
```

✅ **DO:**
```tsx
<Button variant="default">Click</Button>
<Card variant="outlined" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
<Heading as="h1" size="h1">Title</Heading>
<Text variant="muted">Text</Text>
```







