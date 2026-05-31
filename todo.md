# Vayana MVP — Todo

## Design System & Global Theme
- [x] Set up premium design tokens (colors, typography, spacing) in index.css
- [x] Configure Noto Serif Malayalam + Playfair Display fonts
- [x] Build global Navbar with language switcher and auth state
- [x] Build localization dictionary (ML/EN) in shared/i18n.ts

## Database Schema
- [x] Extend users table with bio, avatar_url, preferred_language
- [x] Create books table
- [x] Create bookshelf table (user_id, book_id, status, progress, rating, review)
- [x] Create clubs table
- [x] Create club_members table
- [x] Create club_books table
- [x] Create events table (with location + meeting_link)
- [x] Create event_rsvps table
- [x] Create ai_chats table
- [x] Create ai_messages table
- [x] Run all migrations

## tRPC Routers
- [x] users router: getProfile, updateProfile
- [x] books router: list, search, create, getById
- [x] bookshelf router: list, add, update, remove
- [x] clubs router: list, create, getById, join, leave
- [x] clubMembers router: list, promote, remove
- [x] events router: list, create, getById, rsvp, unrsvp
- [x] aiCoach router: createChat, listChats, getChat, sendMessage

## Pages & UI
- [x] Public landing page (/)
- [x] Dashboard / home feed (/dashboard)
- [x] User profile page (/profile)
- [x] Bookshelf page (/bookshelf)
- [x] Book catalog & search (/books)
- [x] Reading clubs list (/clubs)
- [x] Create club page (/clubs/create)
- [x] Club detail page (/clubs/:id)
- [x] Events list page (/events)
- [x] Create event page (/events/create)
- [x] Event detail page (/events/:id)
- [x] AI Reading Coach list (/ai)
- [x] AI Reading Coach chat session (/ai/chat/:id)

## Features
- [x] Language switcher persisted to user profile
- [x] Book search with debounce
- [x] Reading status: Want to Read / Reading / Completed
- [x] Star rating component
- [x] Progress percentage slider
- [x] Club join/leave functionality
- [x] Event RSVP functionality
- [x] AI bilingual chat with Vayana Ashan
- [x] Book context in AI chat
- [x] Protected routes for authenticated users
- [x] Bilingual UI (Malayalam + English) throughout

## Tests
- [x] auth router tests (logout, me)
- [x] i18n translation key parity tests
- [x] appRouter structure and public/protected procedure tests
- [x] input validation tests for all major routers
