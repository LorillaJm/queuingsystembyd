# Staff Sidebar Implementation

## Overview
Added a responsive sidebar navigation to all staff pages (Staff Dashboard, Summary Report, and MC Display) with hide/show functionality and pin-to-stay feature.

## Features

### 1. Responsive Design
- **Mobile**: Hamburger menu button with overlay
- **Desktop**: Toggle button to show/hide sidebar
- **Smooth transitions** for opening/closing

### 2. Pin Functionality
- Click the pin icon to keep sidebar open permanently
- Pin state is saved to localStorage
- When pinned, sidebar stays open across page refreshes
- When unpinned, sidebar auto-closes after navigation (mobile)

### 3. Navigation Items
- **Staff Dashboard** (`/staff`) - Manage queue and customers
- **Summary Report** (`/summary`) - View customer summary
- **MC Display** (`/mc`) - TV display for customers
- **Registration** (`/`) - Customer registration page

### 4. Visual Indicators
- Current page is highlighted with blue background
- Authentication status badge (green for authenticated)
- Live connection indicator
- Logout button (when authenticated)

### 5. Sidebar Features
- **Header**: BYD Iloilo branding with pin button
- **Navigation**: Icon-based menu with descriptions
- **Footer**: Logout button and copyright info
- **Custom scrollbar**: Styled for better UX

## Files Created/Modified

### Created:
- `apps/web/src/lib/components/StaffSidebar.svelte` - Reusable sidebar component

### Modified:
- `apps/web/src/routes/staff/+page.svelte` - Added sidebar
- `apps/web/src/routes/summary/+page.svelte` - Added sidebar
- `apps/web/src/routes/mc/+page.svelte` - Added sidebar

## Usage

The sidebar is automatically included on all three staff pages. It:
- Shows/hides with the toggle button
- Can be pinned to stay open
- Maintains authentication state
- Provides easy navigation between pages

## Keyboard & Mobile Support
- Touch-friendly on mobile devices
- Overlay closes sidebar when clicked (mobile)
- Smooth animations for better UX
- Responsive breakpoints for different screen sizes

## Pin State Persistence
The pin state is stored in `localStorage` with key `sidebarPinned`:
- `true` - Sidebar stays open
- `false` - Sidebar auto-hides after navigation

## Authentication Integration
- Sidebar shows authentication status
- Logout button appears when authenticated
- Each page maintains its own authentication logic
- MC Display is always accessible (no auth required)
