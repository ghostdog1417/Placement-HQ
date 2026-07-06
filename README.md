# Placement-HQ

A modern job placement and recruitment tracking application built with React and TanStack Router. Manage your job applications, company information, offers, resumes, and placement notes all in one place.

## Features

- 📋 **Companies Management** - Track companies you're interested in
- 💼 **Job Offers** - Manage and organize job offers
- 📄 **Resume Management** - Store and manage multiple resumes
- 📝 **Placement Notes** - Keep detailed notes on your placement journey
- 🔐 **Authentication** - Secure user authentication with Firebase
- 💾 **Cloud Storage** - Firebase backend for data persistence
- 🎨 **Modern UI** - Beautiful, responsive interface with Shadcn UI components
- 📊 **Charts & Insights** - Visual analytics with Recharts
- 🌙 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **TanStack Router** - Type-safe routing
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React components
- **Recharts** - Charts and data visualization

### State Management & Forms
- **React Hook Form** - Efficient form handling
- **TanStack React Query** - Data fetching and caching
- **Zod** - TypeScript-first schema validation

### Backend
- **Firebase** - Authentication, Firestore database, and storage

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Shadcn UI components
│   ├── app-sidebar.tsx # Application sidebar
│   ├── auth-page.tsx   # Authentication page
│   └── page-shell.tsx  # Page layout wrapper
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── auth.tsx        # Firebase auth logic
│   ├── firebase.ts     # Firebase configuration
│   ├── firestore.ts    # Firestore operations
│   ├── storage.ts      # Storage operations
│   ├── types.ts        # TypeScript type definitions
│   ├── utils.ts        # Utility functions
│   └── seed.ts         # Database seeding
├── routes/             # TanStack Router routes
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   ├── companies.tsx   # Companies page
│   ├── offers.tsx      # Offers page
│   ├── resumes.tsx     # Resumes page
│   ├── notes.tsx       # Notes page
│   ├── coding.tsx      # Coding practice page
│   ├── settings.tsx    # Settings page
│   └── routeTree.gen.ts # Auto-generated route tree
├── main.tsx            # Application entry point
├── router.tsx          # Router configuration
└── styles.css          # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- Firebase account with a configured Firestore database

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Placement-HQ
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a `lib/firebase.ts` file with your Firebase configuration
   - Set up Firestore database rules in `firestore.rules`
   - Configure authentication methods in Firebase console

4. Set up environment variables
   - Create a `.env.local` file with your Firebase credentials

## Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

## Usage

1. **Authentication** - Sign up or log in with your account
2. **Add Companies** - Create entries for companies you're targeting
3. **Track Offers** - Log all job offers received
4. **Manage Resumes** - Upload and manage multiple resume versions
5. **Keep Notes** - Document your placement journey and interview experiences
6. **View Insights** - Check charts and statistics on your progress

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Built with ❤️ for placement success**
