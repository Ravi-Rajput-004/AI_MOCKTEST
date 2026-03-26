# MockPrep AI - Backend (Server)

This directory contains the Node.js/Express back-end application, AI workers, and database configuration for MockPrep.

## Tech Stack
- **Framework:** Node.js, Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Task Queues:** BullMQ & Redis (For asynchronous AI generation and evaluation)
- **WebSockets:** Socket.io
- **AI Providers:** Groq API (Llama 3.3 for extreme speed), Google Gemini API (Deep context evaluation)
- **Validation:** Zod / Custom Middleware

For full documentation, database schema definitions, and setup instructions, please see the [Root README](../README.md).
