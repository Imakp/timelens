# TimeLens ⏱️

A personal time-tracking and productivity analytics application built with Next.js 14, Prisma, and SQLite. Track your daily activities in customizable time intervals, categorize your productivity, and gain insights into how you spend your time.

## ✨ Features

- **Interval-Based Time Tracking** — Log activities in configurable intervals (15/30/60 minutes)
- **Customizable Day Structure** — Set your own start/end times for each day
- **Productivity Categories** — Create custom categories with colors and icons to classify your activities
- **Daily Summaries** — Add end-of-day reflections and review your productivity patterns
- **Calendar View** — Navigate through your history with an intuitive calendar interface
- **Analytics Dashboard** — Visualize trends with charts and productivity insights
- **Data Export** — Export your data in CSV and Markdown formats
- **Mobile Responsive** — Fully responsive design with mobile navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Validation**: Zod
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timelens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:reset` | Reset and re-migrate the database |

## 📁 Project Structure

```
timelens/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── export/        # Data export page
│   │   ├── history/       # Historical data view
│   │   ├── review/        # Daily review page
│   │   └── settings/      # Settings page
│   ├── components/        # React components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility functions & actions
│   └── types/             # TypeScript type definitions
└── ...
```

## 🗃️ Database Schema

- **UserSettings** — Global user preferences (interval duration, day start/end times)
- **ProductivityCategory** — Custom categories with color coding and productivity scores
- **ConfigurationTemplate** — Reusable day configuration templates
- **DailyLog** — Daily tracking sessions with status and summary
- **TimeInterval** — Individual time slots with activity logs and categories

## 🎨 Features in Detail

### Time Tracking
Log what you're doing in each time interval throughout your day. Each interval can have a brief activity description and be assigned to a productivity category.

### Productivity Categories
Create custom categories (e.g., "Deep Work", "Meetings", "Break") with:
- Custom colors for visual distinction
- Productivity scores (0-100)
- Optional icons
- Sort order for organization

### Analytics
View your productivity patterns through:
- Daily/weekly/monthly trend charts
- Category distribution visualizations
- Time allocation breakdowns

### Data Export
Export your tracked data in:
- **CSV** — For spreadsheet analysis
- **Markdown** — For documentation or note-taking apps

## 📄 License

This project is private and not licensed for public use.
