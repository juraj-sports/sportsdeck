# App Directory: A Next.js + Convex real-time app directory

App Directory is a lightweight, real-time directory of apps where users can add, discover, and upvote software entries.

## Core Identity
- A live, collaborative app catalog that lets users contribute apps, browse what others have added, and boost favorites with upvotes.
- A blog platform for NBA analysis, player stories, and basketball history.

## Key Capabilities
- Submit apps: users can submit new app entries via the "Get featured" modal with name, description, URL, categories, sports, and optional notification email.
- Discover apps: browse a curated list of apps with descriptions, images, and upvote counts.
- Admin approval: submitted apps appear in the admin panel for review and approval before going live.
- Upvote apps: increment upvotes to surface popular entries.
- Sample data seeding: seed the directory with starter apps to showcase features and interactions.
- Real-time updates: changes propagate to all connected users in real time.
- Blog: read and explore basketball articles with featured header article, article list, and subscription sidebar.

## Focus and Essence
- What it does: provides an app directory UX with submission workflow, approval process, and real-time interactions.
- Why it exists: to offer a minimal, extensible foundation for quickly prototyping community-driven app catalogs and AI-assisted task automation.

## Key Components
- SubmitModal: UI modal for submitting new apps to the directory (accessible via "Get featured" button).
- AppsList: UI for discovering and upvoting apps.
- AdminPageContent: Admin interface for reviewing submissions, approving apps, and managing the directory.
- SeedButton: admin/demo control to seed the database with initial data.
- BlogPageContent: Blog interface with featured header article, article list with tabs, and subscription sidebar.

## Database Schema (High Level)
- apps table
  - id (primary key)
  - name
  - description
  - url
  - image
  - tags (categories)
  - primarySport
  - suggestedCategories (user suggestions)
  - suggestedSports (user suggestions)
  - notificationEmail
  - status (submitted | approved)
  - visible (boolean)
  - upvotes
  - createdAt

Note: This is a high-level summary intended for quick understanding and extension by AI agents. It omits low-level implementation details.

## How It Differs from the Original
- Transformed from a blog-style starter to an interactive app directory with real-time data, app-focused data model, and UI primitives tailored for discovering and promoting apps.
- Submission workflow: users submit apps through a modal interface, which are then reviewed in an admin panel before going live.

## Technologies (High Level)
- Next.js: framework for the frontend and routing.
- Convex: real-time, scalable database and data synchronization.
- Tailwind CSS: styling and design system.

## How This Helps AI Agents
- Provides a concise mental model of the system: a real-time, app-directory experience with a simple data model and UI primitives.
- Highlights core capabilities (submit, discover, approve, upvote, seed) without exposing implementation specifics.
- Enables rapid assessment of relevance for tasks involving full-stack UI-driven data operations and real-time updates.

## Notes
- This README focuses on purpose and capabilities to aid quick understanding and extension by AI agents.
- If you'd like, I can tailor this summary to emphasize specific aspects or adjust the focus for a particular task.
