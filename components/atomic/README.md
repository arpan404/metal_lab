# Atomic Components

A collection of reusable, minimal UI components built with shadcn/ui and Tailwind CSS.

## Components

### StatCard
A premium statistics card with icon, value, label, and optional trend indicator.

**Props:**
- `icon` (string): Emoji or icon to display
- `label` (string): Card label text
- `value` (string | number): Main value to display
- `description` (optional string): Additional description text
- `iconBg` (optional string): Background color class for icon (default: 'bg-violet-100')
- `trend` (optional): Trend object with `value` and `positive` boolean
- `gradient` (optional string): CSS gradient background
- `className` (optional string): Additional CSS classes

**Example:**
```tsx
<StatCard
  icon="🧪"
  label="Experiments Completed"
  value={12}
  iconBg="bg-emerald-100"
  trend={{ value: '+3 this week', positive: true }}
/>
```

### PageHeader
A page header component with title, description, and optional action buttons.

**Props:**
- `title` (string): Page title
- `description` (optional string): Page description
- `action` (optional React.ReactNode): Action buttons or elements
- `className` (optional string): Additional CSS classes

**Example:**
```tsx
<PageHeader
  title="Your Progress"
  description="Track your learning journey"
  action={<Button>View All</Button>}
/>
```

### SectionTitle
A section title component with optional description and action.

**Props:**
- `title` (string): Section title
- `description` (optional string): Section description
- `action` (optional React.ReactNode): Action buttons or elements
- `className` (optional string): Additional CSS classes

**Example:**
```tsx
<SectionTitle
  title="Recent Activity"
  description="Your latest experiments"
  action={<Button variant="ghost">View All</Button>}
/>
```

### EmptyState
A centered empty state component with icon, title, description, and optional action.

**Props:**
- `icon` (optional string | React.ReactNode): Icon to display (default: '📭')
- `title` (string): Empty state title
- `description` (optional string): Description text
- `action` (optional object): Action button with `label`, `onClick`, or `href`
- `className` (optional string): Additional CSS classes

**Example:**
```tsx
<EmptyState
  icon="🎉"
  title="All Caught Up!"
  description="No incomplete labs at the moment"
  action={{
    label: "Browse Labs",
    onClick: () => router.push('/labs')
  }}
/>
```

## Design System

### Colors
- Primary: `slate-900` to `slate-800` (Premium dark)
- Accent: `slate-700` (Refined interactions)
- Success: `emerald-*`
- Warning: `amber-*`
- Info: `sky-*` and `blue-*`
- Background: `slate-50` with subtle `blue-50/20` tints
- Icon backgrounds: `*-50` (Ultra light, modern)

### Spacing
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Card padding: `p-6`
- Grid gaps: `gap-6`

### Typography
- Page title: `text-3xl font-bold`
- Section title: `text-xl font-semibold`
- Card title: `text-lg font-semibold`
- Body text: `text-sm` or `text-base`

### Effects
- Hover lift: `hover:-translate-y-1 hover:shadow-xl`
- Transitions: `transition-all duration-300` or `duration-500`
- Smooth progress: `duration-500 ease-out`
- Premium shadows: Elevated on hover with refined blur
- Subtle borders: `border-gray-200/60` for depth

## Usage

Import components from the atomic folder:

```tsx
import { StatCard, PageHeader, SectionTitle } from '@/components/atomic'
import { EmptyState } from '@/components/atomic/empty-state'
```

Or import individually:

```tsx
import { StatCard } from '@/components/atomic/stat-card'
```

## shadcn/ui Components Used

- `Button` - Action buttons
- `Card` - Container components
- `Badge` - Status indicators
- `Progress` - Progress bars
- `Tabs` - Navigation tabs
- `Avatar` - User avatars
- `Skeleton` - Loading states

All components follow the minimal, premium design philosophy with smooth transitions and modern aesthetics.

## Premium Design Philosophy

The UI uses a sophisticated slate/gray color palette with carefully chosen accents:

- **Slate Black Primary**: Creates a premium, professional feel
- **Subtle Backgrounds**: Light slate and blue tints for depth
- **Ultra-light Icons**: `-50` variants for modern, airy feel
- **Refined Borders**: Semi-transparent borders for layered depth
- **Smooth Animations**: Extended durations (500ms) for luxury feel
- **High Contrast**: Dark slate on light backgrounds for clarity
- **Minimal Accent**: Reserved use of color for maximum impact
