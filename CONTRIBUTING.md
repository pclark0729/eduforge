# Contributing to EduForge

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run database migrations in Supabase
5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and business logic
  - `ai/` - AI provider implementations
  - `content/` - Content generation logic
  - `adaptive/` - Adaptive learning algorithms
  - `supabase/` - Supabase client utilities
- `types/` - TypeScript type definitions
- `supabase/migrations/` - Database migrations

## Code Style

- Use TypeScript for all new code
- Follow Next.js 14+ App Router conventions
- Use Tailwind CSS for styling
- Write components as functional components with hooks
- Use server components when possible for better performance

## Testing

- Test API routes with proper authentication
- Verify database operations work correctly
- Test responsive design on multiple screen sizes

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR with clear description










