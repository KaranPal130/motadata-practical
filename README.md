Email Recipients Manager
This is a Vue.js component for managing email addresses, created as part of the Motadata frontend position application process.
Features

View available recipients, grouped by domain
Select individual recipients or entire company domains
Search for recipients
Add new email addresses after validation
View selected recipients grouped into company and individual email categories
Remove individual recipients or entire domain groups

Tech Stack

Vue 3 with Composition API
Ant Design Vue for UI components
Vite for development and building
Vitest for unit testing

Project Setup
bashCopy# Install dependencies
npm install

# Start development server
npm run serve

# Run unit tests
npm run test

# Build for production
npm run build
Component Structure
The main component is EmailManager.vue which handles all the functionality required in the assignment:

Displaying available and selected recipients
Grouping emails by domain
Searching and filtering
Adding new email addresses with validation
Selecting and deselecting recipients

Testing
A basic test suite has been implemented with Vitest to ensure the component functions correctly. Tests cover:

Component rendering
Email validation
Adding new emails
Selecting and unselecting recipients
Removing company domains

To run the tests:
bashCopynpm run test
Browser Compatibility
The component has been built to work in the latest versions of:

Chrome
Firefox
Edge