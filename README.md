# 🚀 Resume Rocket

**Send your resume to recruiters in one click.** Resume Rocket is a full-stack job application automation tool that lets you email your resume to company HR contacts, track every application you send, manage a contacts list, and visualize your job search progress — all from one dashboard.

---

## ✨ Features

- **One-Click Resume Sending** — Enter a company name and recruiter email, hit send, and your resume is delivered via Gmail SMTP with a customizable email template.
- **Email Template Editor** — Customize the subject line and message body. Upload your resume PDF (up to 5 MB) from the Settings page.
- **Contacts Management** — Full CRUD for HR contacts. Contacts are auto-saved when you send a resume to a new recipient. Export contacts as CSV or JSON.
- **Duplicate Detection** — The app warns you if you've already emailed a particular address, with a confirmation dialog before re-sending.
- **Analytics Dashboard** — Visual charts showing:
  - Applications over time (weekly / monthly / yearly bar & line charts)
  - Top companies you've applied to (pie chart)
  - Total emails sent, weekly count, unique companies, and a daily sending streak
- **User Profiles** — Edit your display name and manage your account.
- **Authentication** — Secure email/password signup and login with email confirmation, powered by Supabase Auth.
- **Responsive Design** — Mobile-first layout with a bottom tab bar on mobile and a top nav bar on desktop.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite 5 |
| Styling | Tailwind CSS · shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Charts | Recharts |
| State / Data | TanStack React Query · Supabase JS Client |
| Backend / DB | Supabase (PostgreSQL · Auth · Storage · Edge Functions) |
| Edge Functions | Deno · denomailer (Gmail SMTP) |
| Testing | Vitest · Testing Library · jsdom |
| Linting | ESLint 9 · typescript-eslint |

---

## 📁 Project Structure

```
resume-rocket/
├── public/                  # Static assets (favicon, robots.txt, resume PDF)
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── AppNav.tsx       # Responsive navigation bar
│   │   ├── ConfirmDialog.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ResumeSenderForm.tsx
│   ├── hooks/               # Custom React hooks
│   ├── integrations/
│   │   └── supabase/        # Supabase client & auto-generated types
│   ├── lib/                 # Utility functions
│   ├── pages/               # Route-level page components
│   │   ├── Index.tsx        # Home — resume sender
│   │   ├── Auth.tsx         # Login / Signup
│   │   ├── Contacts.tsx     # Contact management
│   │   ├── Analytics.tsx    # Charts & stats dashboard
│   │   ├── Settings.tsx     # Email template & resume upload
│   │   └── Profile.tsx      # User profile
│   └── test/                # Test setup & example tests
├── supabase/
│   ├── config.toml          # Supabase local config
│   ├── functions/
│   │   └── send-resume/     # Edge function — sends email via SMTP
│   └── migrations/          # SQL migration files
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (or Bun)
- A **Supabase** project (free tier works)
- A **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

### 1. Clone the repository

```bash
git clone https://github.com/jenish-prog/resume-rocket.git
cd resume-rocket
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

For the Supabase Edge Function, set these secrets in your Supabase dashboard (or via the CLI):

```bash
supabase secrets set GMAIL_USER=your-email@gmail.com
supabase secrets set GMAIL_APP_PASSWORD=your-app-password
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run database migrations

```bash
supabase db push
```

### 5. Deploy the Edge Function

```bash
supabase functions deploy send-resume
```

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:8080**.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

---

## 🗄 Database Schema

### `contacts`
Stores HR contact information per user.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `company_name` | text | Company name |
| `hr_email` | text | Recruiter email address |
| `user_id` | UUID | Foreign key → auth user |
| `created_at` | timestamp | Auto-generated |
| `updated_at` | timestamp | Auto-generated |

### `sent_emails`
Logs every resume email sent.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | text | Recipient email |
| `company` | text | Company name |
| `user_id` | UUID | Foreign key → auth user |
| `sent_at` | timestamp | Auto-generated |

### `email_template`
Stores per-user email template configuration.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `subject` | text | Email subject line |
| `message` | text | Email body content |
| `resume_filename` | text | Filename in Supabase Storage |
| `user_id` | UUID | Foreign key → auth user |
| `updated_at` | timestamp | Auto-generated |

### `profiles`
User profile information.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → auth user |
| `full_name` | text | Display name |
| `avatar_url` | text | Profile picture URL |
| `created_at` | timestamp | Auto-generated |
| `updated_at` | timestamp | Auto-generated |

---

## 🔒 Authentication

Resume Rocket uses **Supabase Auth** with email/password authentication:

1. Users sign up with their email and password → a confirmation email is sent.
2. After confirming, users log in and receive a JWT stored in localStorage.
3. All app routes (except `/auth`) are wrapped in a `ProtectedRoute` component that redirects unauthenticated users.
4. Row-Level Security (RLS) on Supabase ensures users can only access their own data.

---

## 📧 How Email Sending Works

1. The user enters a company name and recruiter email on the home page.
2. The app invokes the `send-resume` Supabase Edge Function via HTTP POST.
3. The edge function:
   - Authenticates the user via their JWT
   - Fetches the email template (subject, message, resume filename) from the database
   - Downloads the resume PDF from Supabase Storage
   - Sends the email via Gmail SMTP (port 465, TLS) using `denomailer`
4. On success, the app logs the sent email to the `sent_emails` table and auto-saves a new contact.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
