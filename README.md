
# CalendarDotAI 

CalendarDotAI is your AI-driven scheduling assistant — a smart calendar with chat-based interactions. Think of it as "Your AI Scheduler", enabling you to interact with your calendar using natural language. Add, delete, or update events just by chatting. Built with Next.js and designed for speed, flexibility, and seamless deployment.

##  Getting Started (Locally)

This is a Next.js project bootstrapped with create-next-app.

### 📦 Install Dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

### 🧪 Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Visit http://localhost:3000 in your browser.

You can start editing the main page by modifying:

`app/page.tsx`

The page auto-updates as you save.

This project uses next/font to optimize and load Geist, a modern typeface from Vercel.

## 🐳 Docker Setup (Cross-Platform)

### 📌 Build Docker Image

```bash
docker build -t calenderdotai .
```

### ▶️ Run Docker Container

```bash
docker run -d -p 3000:3000 --name my-calender-app calenderdotai
```

After the container starts, access your app at: http://localhost:3000

✅ Works On:

- 🪟 Windows (via Docker Desktop)
- 🐧 Linux (Docker installed)
- 🍎 macOS (via Docker Desktop)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) – Learn about features and API.
- [Learn Next.js](https://nextjs.org/learn) – Interactive Next.js tutorial.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) – Feedback and contributions welcome!

##  Deploy on Vercel

The easiest way to deploy your Next.js app is via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Read the [Next.js Deployment Docs](https://nextjs.org/docs/deployment) for more details.

🧠 CalendarDotAI: Your AI Scheduler. Simple. Smart. Conversational.
