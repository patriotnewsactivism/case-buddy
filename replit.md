# American Injustice · Case Intelligence Portal

## Overview

This is a comprehensive case intelligence portal designed to organize, analyze, and present legal case information in a systematic way. The application serves as a digital repository for legal documents, evidence, timeline events, FOIA requests, and case analysis tools. Built as a full-stack web application, it provides an intuitive interface for managing complex legal cases with features like document management, timeline visualization, evidence galleries, and advanced search capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**
- React-based single-page application built with TypeScript
- Uses Vite as the build tool and development server
- Implements client-side routing with Wouter for navigation
- State management handled through React Query (@tanstack/react-query) for server state
- Component library based on shadcn/ui with Radix UI primitives
- Styled with Tailwind CSS using a custom design system
- Responsive design with mobile-first approach using custom breakpoints

**Component Structure**
- Modular component architecture with reusable UI components
- Case-specific components for documents, timeline events, evidence galleries
- Layout components for consistent page structure
- Form components with React Hook Form integration
- Custom hooks for search functionality and mobile responsiveness

**Backend Architecture**
- Express.js server with TypeScript
- RESTful API design with route-based organization
- Middleware for request logging and error handling
- Object storage integration with Google Cloud Storage
- File upload handling with access control policies
- Development-specific Vite integration for hot module replacement

**Data Storage Solutions**
- PostgreSQL database as primary data store
- Drizzle ORM for database schema management and queries
- Database migrations handled through Drizzle Kit
- Neon Database serverless PostgreSQL for cloud deployment
- In-memory storage fallback for development/testing

**Database Schema Design**
- Users table for authentication and access control
- Case documents table with metadata, tags, and file paths
- Timeline events table with chronological case developments
- FOIA requests table tracking government information requests
- Case notes table for additional documentation
- JSON fields for flexible tag and reference storage

**Authentication and Authorization**
- Session-based authentication system
- PostgreSQL session store (connect-pg-simple)
- Object-level access control with custom ACL policies
- Public and private object access patterns
- File upload access controls

**File Management System**
- Google Cloud Storage integration for document storage
- Uppy.js for client-side file upload with progress tracking
- Presigned URL generation for direct-to-cloud uploads
- Public and private file serving endpoints
- File search capabilities across public and private storage

**Search and Analytics**
- Fuse.js for client-side fuzzy search functionality
- Advanced filtering by document type, date ranges, and tags
- Search across documents, timeline events, and case notes
- Analytics dashboard with data visualization using Recharts
- Export functionality for reports and case summaries

**Design System**
- CSS custom properties for theming
- Dark/light mode support with system preference detection
- Consistent spacing, typography, and color schemes
- Responsive breakpoints and mobile-optimized layouts
- Print-friendly styles for document export

## External Dependencies

**Frontend Libraries**
- React ecosystem: React, React DOM, React Query
- UI Components: Radix UI primitives, shadcn/ui component library
- Styling: Tailwind CSS, class-variance-authority for component variants
- Forms: React Hook Form with Hookform Resolvers
- Search: Fuse.js for fuzzy search capabilities
- Charts: Recharts for data visualization
- File Upload: Uppy with AWS S3 plugin
- Icons: Lucide React icon library
- Date Handling: date-fns for date manipulation

**Backend Dependencies**
- Express.js web framework
- Database: Drizzle ORM, PostgreSQL driver (@neondatabase/serverless)
- File Storage: Google Cloud Storage SDK
- Session Management: connect-pg-simple for PostgreSQL sessions
- Development Tools: tsx for TypeScript execution, esbuild for production builds

**Build and Development Tools**
- Vite for frontend development and building
- TypeScript for type safety
- ESBuild for server-side bundling
- PostCSS with Autoprefixer for CSS processing
- Replit-specific development plugins and error overlays

**Cloud Services**
- Neon Database for serverless PostgreSQL hosting
- Google Cloud Storage for file and document storage
- Replit hosting platform with integrated development environment
- Environment-based configuration for different deployment stages

**Development and Testing**
- Hot module replacement in development
- TypeScript strict mode compilation
- Path mapping for clean imports
- Print media queries for document export functionality
- Error boundary handling and logging