# MIOS (Marketing Intelligence OS)

MIOS is a centralized platform designed to turn daily marketing activity into compounding institutional knowledge. Instead of losing learnings when campaigns end or team members leave, MIOS captures performance data, experimental results, and consumer psychology insights into a permanent, searchable database.

## Core Features
- **Dashboard**: Real-time overview of campaign performance and critical metrics.
- **Campaigns**: Track and manage marketing campaigns across different platforms.
- **Creative Library**: Analyze ad creatives for what drives engagement and conversions.
- **Experiments**: Document A/B tests and store conclusive learnings.
- **Customer Profiles**: Build psychological profiles of your target audience.
- **Knowledge Base**: Search and retrieve verified marketing rules and historical data.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Ensure you have your `.env.local` configured with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable UI components (organized by domain)
- `/src/lib` - Utility functions, constants, and Supabase client configuration
- `/src/hooks` - Custom React hooks for data fetching and state management
- `/docs` - Project documentation, data models, and architectural standards
