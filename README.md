---
title: CareSync - Sentient Care Coordination Platform
emoji: 🏥
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# CareSync 🏥

**Sentient Care Coordination Platform** - An AI-powered family care management system that transforms medical documents into actionable tasks.

## 🌟 Features

- **🧠 The Brain Upload**: Drag-and-drop medical documents for AI analysis using Groq Vision
- **👨‍👩‍👧‍👦 The Family Hub**: Real-time dashboard for family care coordination
- **💬 Sentient Chat**: AI assistant for medical document Q&A
- **🎯 Smart Task Management**: Automatic task extraction and assignment
- **⚡ Real-time Updates**: Live collaboration with Supabase Realtime

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **AI**: Groq API (llama3-70b-8192, llama-3.2-11b-vision-preview)
- **UI**: Shadcn/UI with glassmorphism design
- **State**: Zustand

## 🎨 Design Philosophy

CareSync embodies "Organic Intelligence" with:
- Glassmorphism and soft gradients
- Rounded "Bento Grid" layouts
- Breathing animations and smooth transitions
- Electric Indigo (#6366f1) and Soft Lavender (#e0e7ff) palette

## 🏗️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq API
GROQ_API_KEY=your_groq_api_key
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Enable Realtime for all tables
4. Configure Storage bucket for document uploads

### 3. Local Development

```bash
npm install
npm run dev
```

### 4. Deployment to Hugging Face Spaces

1. Push this repository to Hugging Face Spaces
2. Set environment variables in Space settings
3. The app will automatically deploy using Docker

## 🎯 Core Workflows

### Document Analysis Flow
1. User uploads medical document (PDF/Image)
2. Groq Vision API extracts text and identifies tasks
3. Tasks are automatically created and categorized
4. Family members receive real-time notifications

### Task Management Flow
1. Tasks appear in the Family Hub dashboard
2. Family members can claim tasks via drag-and-drop
3. Progress updates sync in real-time
4. Completed tasks trigger notifications

### Sentient Chat Flow
1. Users can ask questions about uploaded documents
2. AI provides contextual answers based on document content
3. Chat history is preserved per family

## 🏆 Hackathon Features

- **One-click deployment** to Hugging Face Spaces
- **Real-time collaboration** for family care coordination
- **AI-powered document analysis** with Groq Vision
- **Intuitive drag-and-drop** task assignment
- **Responsive design** with smooth animations

## 📱 Demo

Visit the live demo: [CareSync on Hugging Face Spaces](https://huggingface.co/spaces/your-username/caresync)

## 🤝 Contributing

Built for the Hackathon with ❤️ by [Your Team Name]

## 📄 License

MIT License - see LICENSE file for details