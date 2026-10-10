# PersonaHire — AI-Based Personalized Placement Tracking & Interview Simulator

**A personalized placement preparation platform designed to help students practice, track progress, identify weak areas, and prepare for campus recruitment.**

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-Backend_Prototype-3776AB?logo=python&logoColor=white)](https://www.python.org/)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Technical Architecture](#technical-architecture)
- [Application Workflow](#application-workflow)
- [UI/UX Design](#uiux-design)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Current Implementation Status](#current-implementation-status)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Overview

**PersonaHire** is a placement preparation and progress-tracking application designed to help students prepare for technical interviews and campus recruitment in one place.

The platform brings together coding practice, assessment modules, interview preparation, progress tracking, and personalized study recommendations. It aims to help students understand their strengths and weaknesses and follow a structured preparation workflow.

The project uses a React and TypeScript frontend with a component-based architecture. A Python Flask backend prototype is also available for API integration experiments. Some modules currently use mock data or simulated behavior.

## Problem Statement

Students often use separate platforms for coding practice, aptitude preparation, mock interviews, assessment tracking, and placement information. This can make it difficult to monitor overall readiness and maintain a consistent preparation plan.

PersonaHire addresses this problem by bringing these activities into a unified interface with progress summaries and suggested next steps.

## Objectives

- Provide a centralized placement preparation platform.
- Organize practice activities into accessible modules.
- Help students identify weak areas through assessment results.
- Track practice history and placement readiness indicators.
- Offer coding practice with problem categories and difficulty levels.
- Support interview preparation and placement simulation workflows.
- Recommend preparation activities based on available performance data.

## Key Features

### 1. Dashboard

- Overview of placement preparation activities.
- Progress and assessment summaries.
- Recommended next steps.
- Navigation to preparation modules.

### 2. Coding Practice

- Coding problems organized by difficulty and topic.
- Code editor interface.
- Programming language selection.
- Submission feedback and result display.
- Practice workflow inspired by online coding platforms.

**Current limitation:** The frontend coding submission is simulated. It does not execute submitted code against a real compiler or test-case engine.

### 3. Interview Preparation

- Interview preparation interface.
- Technical and HR interview practice workflows.
- Practice sessions designed to support interview readiness.

The availability of real-time voice interaction and AI-generated feedback depends on the implemented integration; these should not be assumed to work unless configured and tested.

### 4. Assessment and Placement Simulation

- Assessment modules for practicing relevant placement topics.
- Full placement simulation workflow.
- Assessment summaries and score displays.

### 5. Progress Tracking

- Assessment history.
- Progress summaries and score visualizations.
- Topic-level performance information.
- Identification of weak areas where the available data supports it.

### 6. Personalized Recovery Plan

- Suggested preparation activities.
- Topic-based practice plans.
- Recommended next steps based on available performance information.

### 7. Profile and Placement Preparation

- Student-oriented profile interface.
- Centralized access to preparation activities.
- Placement readiness workflow.

*Note: Some screens and metrics use mock or predefined data. They should not be interpreted as verified real-world placement predictions.*

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| TypeScript | Type-safe frontend development |
| Vite | Development server and production build |
| Tailwind CSS | Responsive styling and layout |
| Lucide React | Icons and interface visuals |
| React Router | Client-side page navigation, where configured |
| Context API | Shared application state through React context |
| Python | Backend prototype language |
| Flask | Backend HTTP API framework |
| Flask-CORS | Cross-origin API configuration |
| MySQL | Planned database integration |

**Architecture note:** MySQL is part of the planned database layer; a fully integrated persistent database should not be considered available until its connection, schema, and CRUD operations have been implemented and tested.

## Technical Architecture

PersonaHire follows a component-based frontend architecture, with a separate backend prototype for API experiments.

### Architecture Diagram

```text
                 STUDENT / USER
                       |
                       v
               React Web Interface
                 React + TypeScript
                       |
             +---------+---------+
             |         |         |
             v         v         v
          Dashboard  Coding   Assessments
                     Practice  & Interviews
             |         |         |
             +---------+---------+
                       |
                       v
            Shared State and Data Layer
              Context API / Mock Data
                       |
                       v
               Optional API Layer
                 HTTP / REST
                       |
                       v
                Python Flask API
                       |
             +---------+----------+
             |                    |
             v                    v
       API Validation       External Services
                            (when integrated)

       Planned: MySQL persistence
```

The diagram describes the intended integration structure. Not every connection is currently active in the application.

### Frontend Architecture

The frontend is responsible for rendering pages, managing user interactions, displaying practice results, and coordinating shared application state.

Its major layers are:

1. **Pages:** Screens for dashboard, coding practice, interviews, assessments, and progress.
2. **Reusable components:** Shared cards, buttons, badges, layouts, and interface elements.
3. **State management:** React hooks and context for shared application data.
4. **Data layer:** Mock or predefined data used by supported demo modules.
5. **Build layer:** Vite for local development and optimized production builds.

### Backend Architecture

The Python Flask prototype provides a foundation for HTTP API integration.

The backend can be run locally to test its health endpoint and develop API routes. A production deployment would require a reachable hosting environment, proper configuration, request validation, and integration with persistent storage or external services where needed.

### Data Flow

1. A student opens a module in the React application.
2. The page displays available problems, questions, or progress information.
3. The student interacts with the interface.
4. The application processes the action using its current frontend logic or a configured API.
5. The resulting feedback or data is displayed in the interface.

For the current coding demo, submission results are generated by frontend simulation rather than actual code execution.

## Application Workflow

```text
Open PersonaHire
       |
       v
View Dashboard
       |
       v
Choose Preparation Module
       |
       +----> Coding Practice
       |
       +----> Assessment
       |
       +----> Interview Preparation
       |
       v
Review Available Feedback
       |
       v
Check Progress and Weak Areas
       |
       v
Continue with Recommended Practice
```

## UI/UX Design

PersonaHire uses a modern, dashboard-oriented interface intended to make placement preparation easier to navigate.

### Design Principles

- **Consistency:** Reusable components and consistent interface patterns.
- **Clarity:** Clear labels, readable typography, and structured content.
- **Accessibility:** Adequate contrast and recognizable interaction controls.
- **Responsiveness:** Layouts intended to adapt to different screen sizes.
- **Feedback:** Visual indicators for assessment status, scores, and submission results.
- **Maintainability:** Shared UI components reduce duplication across pages.

### Design System

The interface uses Tailwind CSS utility classes and shared components to maintain a consistent visual language.

Core design elements include:

- Consistent spacing and alignment.
- Reusable cards, buttons, and badges.
- Status indicators for results and progress.
- Icons from Lucide React.
- Responsive page layouts.

### Design Architecture

```text
Application Layout
       |
       +---- Navigation
       |
       +---- Page Content
       |        |
       |        +---- Reusable Cards
       |        +---- Forms and Controls
       |        +---- Progress Indicators
       |        +---- Result Panels
       |
       +---- Shared UI Components
```

## Project Structure

The following is a simplified representation of the repository. Individual files and folders may differ slightly in the actual checkout.

```text
PersonaHire_current_corrected/
└── project/
    ├── public/
    │   └── _redirects
    ├── src/
    │   ├── components/
    │   │   └── ui/
    │   ├── context/
    │   │   └── DataContext.tsx
    │   ├── data/
    │   │   └── mockData.ts
    │   ├── pages/
    │   │   └── modules/
    │   │       └── CodingPage.tsx
    │   ├── utils/
    │   │   └── cn.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── backend/
    │   ├── app.py
    │   └── requirements.txt
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    └── README.md
```

## Installation and Setup

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's dependencies.
- npm — included with Node.js.
- [Git](https://git-scm.com/) — for cloning and version control.
- [Python](https://www.python.org/) — only needed to run the optional Flask backend.

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/rashmikan21/PersonaHire_current_corrected.git
```

### 2. Navigate to the Frontend Project

```bash
cd PersonaHire_current_corrected/project
```

The `package.json` file is located inside the `project` directory.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal. It is commonly `http://localhost:5173`.

### 5. Create a Production Build

```bash
npm run build
```

Vite normally generates the production files in the `dist/` directory.

To test the production build locally:

```bash
npm run preview
```

## Running the Optional Flask Backend

The frontend demo can use simulated coding submissions without the backend. Run the backend separately only when testing its API.

### 1. Open a Second Terminal

```bash
cd PersonaHire_current_corrected/project/backend
```

Adjust the path if you cloned the repository into a different directory.

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use Command Prompt:

```bat
venv\Scripts\activate.bat
```

### 3. Install Backend Dependencies

If `requirements.txt` is present and contains the required packages:

```bash
pip install -r requirements.txt
```

Otherwise, install the packages required by the current backend implementation.

### 4. Start Flask

```bash
python app.py
```

If configured as previously tested, the backend listens at:

`http://127.0.0.1:5000`

Health check:

`http://127.0.0.1:5000/api/health`

The health endpoint verifies that the Flask application is running; it does not verify that an external code execution service is operational.

## Configuration

### Vite API Proxy

The development configuration may proxy frontend requests beginning with `/api` to the local Flask server.

Example configuration:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true
    }
  }
}
```

Keep the proxy inside the existing Vite configuration rather than replacing other settings.

### Frontend and Backend Deployment

A local API URL such as `127.0.0.1:5000` refers to the user's own computer. It is not a public backend URL.

When deploying the frontend, API-dependent features need a publicly reachable backend URL and appropriate CORS and environment configuration. Deploying the React frontend alone does not deploy the Flask application.

## Current Implementation Status

| Component | Status |
|---|---|
| React frontend | Implemented |
| Shared UI components | Implemented |
| Dashboard and preparation interfaces | Available in the application; some content uses demo data |
| Coding editor and problem selection | Implemented as a frontend interface |
| Coding submission feedback | Simulated frontend behavior |
| Flask backend prototype | Available for local API testing |
| Backend health endpoint | Previously tested locally |
| Real compiler and test-case execution | Not currently verified |
| MySQL persistent storage | Planned / integration not verified |
| Live AI interview evaluation | Requires implementation and testing |
| Production authentication and authorization | Not verified |
| Public frontend deployment | Configure and verify through the chosen hosting provider |

## Future Enhancements

- Integrate a reliable code execution engine with isolated execution and test-case evaluation.
- Connect MySQL for persistent user profiles, submissions, assessments, and progress.
- Implement secure registration, login, and session management.
- Add genuine AI-supported interview evaluation with relevant, explainable feedback.
- Support voice-based interview practice where appropriate.
- Improve personalized recommendations using verified assessment history.
- Add testing, logging, error handling, and API security controls.
- Deploy the frontend and backend with separate environment configurations.
- Add automated tests and continuous integration.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected functionality.
5. Submit a pull request describing the changes.

## License

No license has been specified yet. Add a `LICENSE` file before distributing the project under a particular open-source license.

---

**PersonaHire — Prepare with purpose. Practice with consistency. Track your progress.**
