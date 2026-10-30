# Activity Tracker Desktop (Bitácora de Actividades)

[![Desktop Build](https://img.shields.io/github/actions/workflow/status/aledash3/activity-tracker-desktop/desktop-release.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/aledash3/activity-tracker-desktop/actions)
[![React 19](https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Electron](https://img.shields.io/badge/Electron-41.2-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/aledash3/activity-tracker-desktop/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Español](https://img.shields.io/badge/Idioma-Espa%C3%B1ol-orange?style=for-the-badge)](README.es.md)

Native desktop application for tracking Monday-to-Friday work and research activities, managing weekly hour targets, customizing visual and typographic themes, and generating signed PDF and CSV reports.

> **Language / Idioma:** English | [Leer documentación en Español](README.es.md)

---

## Interface Preview

<p align="center">
  <img src="docs/assets/app_preview.svg" alt="Activity Tracker Desktop Interface Preview" width="100%">
</p>

---

## Overview

**Activity Tracker Desktop** is built for researchers, university staff, and engineering teams who need a dedicated desktop logbook to record daily tasks, monitor weekly hour quotas, and export institutional reports without running local web servers or relying on external cloud services.

---

## Architectural & Functional Highlights

- **Monday-to-Friday Workweek Board:** Full-viewport 5-column layout with quick-add controls per day, status toggles (`Completed` / `Pending`), and a monthly calendar popover that disables weekend dates.
- **Implicit Daily Break Deduction:** Configurable daily break window (default `13:00` to `14:00`, `60` minutes). When an activity spans across the configured break interval (for example `08:00` to `17:00`), the calculator automatically subtracts the break duration and records `8h` of effective work without cluttering cards or exported reports.
- **Weekly Quota Progress:** Inline and profile-level configuration for required weekly hours (`meta_horas_semanales`) with real-time completion metrics.
- **Visual & Calligraphy Studio:**
  - Light and Dark themes.
  - 6 curated accent palettes plus a native HEX color picker that dynamically styles both the interface and generated PDF headers.
  - 7 typography and calligraphy options (`Plus Jakarta Sans`, `Inter`, `Lora`, `Playfair Display`, `Caveat`, `Dancing Script`, and `JetBrains Mono`).
  - Adjustable font scaling (`Compact`, `Normal`, `Large`) and border radius presets (`Sharp`, `Smooth`, `Rounded`).
- **Executive PDF & CSV Reporting:**
  - **PDF Reports (`jsPDF` + `jspdf-autotable`):** Generates institutional headers, user profile metadata, itemized activity tables, effective hour summaries, and dual signature blocks (responsible person and supervisor/coordinator).
  - **CSV Export:** Produces UTF-8 BOM semicolon-delimited files ready for Microsoft Excel.
  - **JSON Backups:** Single-click full state export and import (`perfil`, `categorias`, `apariencia`, and `actividades`).

---

## Project Structure

```text
activity-tracker-desktop/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md        # Standardized bug report template
│   │   └── feature_request.md   # Standardized feature request template
│   └── workflows/
│       └── desktop-release.yml  # Automated Windows x64 build & release pipeline
├── build/
│   ├── icon.ico                 # Multi-resolution Windows executable icon
│   └── icon.png                 # High-resolution application icon
├── docs/
│   └── assets/
│       └── app_preview.svg      # Vector UI preview for documentation
├── electron/
│   ├── main.cjs                 # Electron main process & native window lifecycle
│   └── preload.cjs              # Context-isolated preload bridge
├── public/
│   └── icon.png                 # Application favicon asset
├── scripts/
│   └── generate-icons.ps1       # Automated icon asset generator
├── src/
│   ├── components/
│   │   ├── ActivityCard.jsx     # Individual activity item card
│   │   ├── ActivityModal.jsx    # Create/edit activity dialog with validation
│   │   ├── AppearanceModal.jsx  # Theme, accent color & calligraphy studio
│   │   ├── CatalogModal.jsx     # Custom activity category manager
│   │   ├── MiniCalendar.jsx     # Monthly date picker (Mon-Fri enabled)
│   │   ├── Navbar.jsx           # Top navigation bar & quick actions
│   │   ├── ProfileModal.jsx     # Workplace, role & implicit break settings
│   │   ├── ReportsModal.jsx     # Report filtering, KPI summary & PDF/CSV export
│   │   ├── WeekNavigator.jsx    # Week selector & weekly hour progress bar
│   │   └── WeeklyGrid.jsx       # 5-column Monday-to-Friday board
│   ├── utils/
│   │   ├── csvExport.js         # Excel-compatible CSV generator
│   │   ├── dateUtils.js         # Date arithmetic & implicit break hour math
│   │   ├── pdfExport.js         # Institutional PDF report builder
│   │   └── storage.js           # Local persistence, palettes & JSON backup I/O
│   ├── App.jsx                  # Root state orchestration & CSS variable injection
│   ├── index.css                # Design tokens, responsive grid & print styles
│   └── main.jsx                 # React 19 DOM entry point
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution & Conventional Commits guide
├── LICENSE                      # MIT License
├── README.es.md                 # Spanish documentation
├── README.md                    # English documentation
├── index.html                   # Application HTML shell
├── package.json                 # Dependencies, scripts & electron-builder config
└── vite.config.js               # Vite bundler configuration (relative base path)
```

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Runtime** | Electron 41 | Native desktop window, OS integration, sandboxing |
| **Packaging** | Electron Builder (NSIS) | Windows `.exe` setup wizard and portable binary generation |
| **Frontend Library** | React 19 | Component architecture and reactive state management |
| **Build Tool** | Vite 8 | Fast HMR development and optimized production bundling |
| **Report Engine** | jsPDF & AutoTable | Client-side vector PDF generation with dynamic styling |
| **Icons** | Lucide React | Consistent vector iconography |
| **Static Analysis** | Oxlint | High-speed JavaScript/JSX linting |

---

## End-User Installation (Windows)

End users can run the application directly on Windows without installing Node.js or any development tools:

1. Go to the [Releases](https://github.com/aledash3/activity-tracker-desktop/releases) page.
2. Download one of the available executables:
   - **`Bitacora de Actividades Setup 1.0.0.exe` (Recommended):** Runs the standard Windows NSIS installation wizard, lets you choose the target directory, creates Desktop and Start Menu shortcuts, and registers an uninstaller.
   - **`Bitacora de Actividades 1.0.0.exe` (Portable):** Runs immediately as a standalone executable without installation or administrator privileges.

---

## Development & Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- `npm` v10 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/aledash3/activity-tracker-desktop.git
cd activity-tracker-desktop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite web development server on `http://127.0.0.1:5173` |
| `npm run desktop:dev` | Launch native Electron window connected to Vite HMR |
| `npm run build` | Compile production web assets into `dist/` |
| `npm run lint` | Run static code analysis with `oxlint` |
| `npm run desktop:pack` | Package unpacked desktop binary in `release/win-unpacked/` |
| `npm run build:exe` | Build both the Windows NSIS Setup `.exe` and Portable `.exe` in `release/` |

---

## Author

**David Alejandro Cruz Palacios**  
Computer Science Engineering Student - Universidad Politécnica Salesiana  
GitHub: [@aledash3](https://github.com/aledash3)

---

## License

This project is licensed under the terms of the [MIT License](LICENSE).
