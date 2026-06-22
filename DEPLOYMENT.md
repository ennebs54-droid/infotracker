# TrackSuite - Netlify + GitHub Deployment Guide

This project no longer uses Firebase. All tracking data is stored locally in the browser using localStorage.

## How Data Storage Works

- **Local Storage**: All tracking data is stored in the browser's localStorage
- **No Backend Required**: The app works completely client-side
- **Data Persistence**: Data persists across browser sessions for the same device

## Quick Start

1. Visit `data-init.html` to initialize sample tracking data
2. Go to `index.html` to track shipments
3. Go to `create.html` to create new tracking IDs
4. Go to `admin.html` to manage tracking data

## Deploying to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build command: (leave empty - static site)
4. Set publish directory: `/` (root)
5. Deploy!

## Environment Variables

No environment variables needed since we're using localStorage instead of Firebase.

## Browser Compatibility

Works on all modern browsers that support localStorage:
- Chrome/Chromium 4+
- Firefox 3.5+
- Safari 4+
- Edge 12+
- Mobile browsers

## Data Limits

localStorage typically has a 5-10MB limit per domain, which is plenty for tracking data.
