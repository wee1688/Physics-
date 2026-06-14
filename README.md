# IB Physics Gravitation App

This is a comprehensive, cross-device IB Physics application designed for interactive data analysis, spaced repetition, and experimental simulation.

## Features
- **Spaced Repetition Engine (SM2)**: Tracks student progress using a modified SuperMemo-2 model to optimize recall of syllabus subtopics.
- **Data Analysis Workspace**: Interactive tools for Paper 3 Section A data analysis, including linearization and uncertainty calculation verification.
- **Cross-Device Sync**: Real-time Supabase integration allows seamless transition between mobile and desktop environments.

## Deployment Preparation
This project is configured for deployment on static hosting platforms like Vercel or Netlify.

### Environment Configuration
Before deploying, set the following environment variables in your hosting provider:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Setting up GitHub
1. Create a new repository on GitHub.
2. Push this project to your repository.
3. In your hosting platform (Vercel/Netlify), import this repository.
4. Add the environment variables listed above in your hosting platform's dashboard.
