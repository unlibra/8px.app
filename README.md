# 8px.app

Everything you need for web development, simplified. A collection of tools that bridge code and design, sparking creativity for modern creators.

## Project Structure

```
/
├── frontend/         # Next.js frontend
├── backend/          # FastAPI backend
└── ...
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 3
- **Backend**: FastAPI, Python 3.12, NumPy, Pillow

## Features

- **TW Palette Generator** - Generate Tailwind-style color palettes from any color
- **ImagePalette++** - Extract color palettes from images using k-means++ in Oklab color space
- **Favicon Generator** - Create favicon and Apple Touch Icon from images
- **SVG Optimizer** - Optimize and compress SVG files

## Getting Started

### Quick Start (Docker Compose - Recommended)

```bash
# Setup environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start development environment
./run-dev.sh
```

Visit:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>

### Manual Setup

#### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

#### Backend

```bash
cd backend
cp .env.example .env
python3.12 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
uvicorn src.app.main:app --reload
```

## Development

### Docker Compose (Recommended)

- Start: `./run-dev.sh`
- View logs: `docker compose logs -f`
- Stop: `docker compose down`

### Manual

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && source venv/bin/activate && uvicorn src.app.main:app --reload`

### Code Quality

- Frontend lint: `cd frontend && npm run lint`
- Frontend type check: `cd frontend && npm run type-check`
- Backend lint: `cd backend && source venv/bin/activate && ruff check src/`
- Backend type check: `cd backend && source venv/bin/activate && mypy src/`

## License

AGPL-3.0
