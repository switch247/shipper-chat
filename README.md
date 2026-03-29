# Shipper Chat

A modern, real-time chat application designed for logistics and shipping professionals, featuring AI-powered assistance and seamless communication.

## 🚀 Features

- **Real-time Messaging**: Instant messaging with WebSocket connections
- **AI Assistant**: Integrated AI bot for logistics queries and support
- **User Management**: Authentication, user profiles, and contact management
- **Responsive Design**: Mobile-first design with collapsible panels
- **Dark/Light Mode**: Theme switching with next-themes
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.2 with OKLCH color system
- **Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form with Zod validation
- **Themes**: next-themes

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 7.6 with Neon adapter
- **Real-time**: Socket.io
- **Authentication**: JWT with bcrypt
- **AI Integration**: Google Gemini API via AI SDK
- **Validation**: Zod

### Infrastructure
- **Database Hosting**: Neon (Serverless PostgreSQL)
- **Deployment**: Ready for Vercel/Netlify (frontend) and Railway/Render (backend)
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
shipper-chat/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app router pages
│   │   ├── (authenticated)/ # Protected routes
│   │   ├── auth/          # Authentication pages
│   │   └── chat/          # Main chat interface
│   ├── components/        # Reusable UI components
│   │   ├── chat/          # Chat-specific components
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities and configurations
│   └── public/            # Static assets
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── ai/            # AI integration routes
│   │   ├── auth/          # Authentication routes
│   │   ├── chat/          # Chat routes
│   │   └── lib/           # Database and utilities
│   ├── prisma/            # Database schema and migrations
│   └── generated/         # Prisma client
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipper-chat
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install
   ```

3. **Environment Setup**

   Copy the example environment files and configure them:

   ```bash
   # Backend
   cp server/.env.example server/.env

   # Frontend
   cp client/.env.example client/.env.local
   ```

   Then update the following values in the copied files:

   **server/.env:**
   ```env
   DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host:your_db_port/your_db_name
   PORT=3001
   CLIENT_URL=http://localhost:3000
   GOOGLE_GENERATIVE_AI_API_KEY=your_actual_gemini_api_key
   JWT_SECRET=your_secure_jwt_secret
   ```

   **client/.env.local:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Authentication
- Sign up for a new account or log in
- JWT tokens handle session management

### Chat Interface
- **Left Panel**: User list and search
- **Center**: Chat messages and input
- **Right Panel**: Contact information (collapsible)

### AI Assistant
- Mention the AI bot in conversations
- Ask logistics-related questions
- Get real-time assistance

## 🔧 Development

### Available Scripts

**Frontend (client/)**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend (server/)**
- `npm run dev` - Start development server with tsx
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run seed` - Seed database with initial data

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration
- Prettier for code formatting
- Husky pre-commit hooks (recommended)

## 🚀 Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting service:
```bash
cd client
npm run build
# Deploy the .next folder
```

### Backend
Deploy to Railway, Render, or Heroku:
```bash
cd server
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) for the component library
- Real-time functionality powered by [Socket.io](https://socket.io/)
- Database managed with [Prisma](https://prisma.io/)
- AI integration via [Google Gemini](https://ai.google.dev/)