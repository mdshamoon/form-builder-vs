# Format Forge Mobile - Frontend

Mobile-first React frontend with canvas-based template editor.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit: http://localhost:5173

## Features

- 📱 Mobile-first canvas editor
- 🎨 Figma-like zoom/pan
- ✋ Touch gestures (pinch, pan, tap)
- 🔄 Real-time form filling
- 🎯 TypeScript + React 18
- 📦 Zustand + React Query

## Environment

Create \`.env\`:

\`\`\`
VITE_API_URL=http://localhost:8000
\`\`\`

## Architecture

- **TemplateCanvas** - Main canvas with zoom/pan
- **FieldOverlay** - Field positioned on template
- **FieldEditorPopup** - Mobile/desktop field editor
- **TemplateSelector** - Browse templates
- **Zustand Store** - Client state
- **React Query** - Server state

See [../README.md](../README.md) for full documentation.
