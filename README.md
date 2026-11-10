# Job Studio

AI-powered job opportunity evaluator, ATS-tailored resume generator, and verified application studio.

## Overview

Job Studio helps candidates discover high-alignment roles across leading tech and business companies, evaluates compatibility using verifiable qualification matching, and generates ATS-optimized resumes and interview preparation materials in seconds.

## Key Features

- **Live Role Discovery**: Discover live positions across curated company boards or analyze any custom job listing URL or text.
- **Job Evaluator & Compatibility Scoring**: Verifiable 100-point compatibility score, ATS keyword matching, missing competency detection, and actionable application recommendations.
- **ATS-Tailored Resume & Documents**: Instant resume tailoring, role-aligned cover letters, and targeted screening responses powered by Google Gemini on Vertex AI.
- **Interview Preparation**: Real-world interview questions and STAR-method responses tailored to candidate experience and company expectations.
- **Application Tracking**: Manage and track verified job applications with audit history.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sushm1t/Jobstudio.git
cd Jobstudio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Production

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### Running Tests

```bash
# Run unit and integration tests
npm run test
```

## Tech Stack

- **Framework**: TanStack Start (SSR), TanStack Router
- **Frontend**: React 19, TypeScript, Tailwind CSS, GSAP
- **AI Engine**: Google Gen AI SDK (`@google/genai`) on Vertex AI (`gemini-3.8-flash`)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth)
- **Document Export**: jsPDF, Canvas rendering
