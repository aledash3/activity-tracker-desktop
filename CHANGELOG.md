# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-30

### Added
- Five-column Monday-to-Friday weekly activity board with full-viewport layout and quick-add actions.
- Implicit and configurable daily break deduction (`receso_inicio`, `receso_fin`, `receso_minutos`) for automatic effective hour calculations.
- Weekly hour target configuration (`meta_horas_semanales`) with real-time progress bar and completion indicators.
- Visual and calligraphy customization studio (`AppearanceModal`) supporting Light/Dark mode, 6 curated color palettes, custom HEX color picker, 7 Google Fonts (including handwritten and cursive calligraphy options), font scaling, and border radius presets.
- Executive PDF report generator (`jsPDF` + `jspdf-autotable`) with institutional header, dynamic accent color, activity breakdown, and dual signature blocks.
- Excel-compatible UTF-8 BOM CSV export and full JSON backup export/import.
- Native Windows desktop packaging via Electron and `electron-builder` (NSIS installer wizard and standalone portable executable).
- Automated GitHub Actions workflow (`desktop-release.yml`) for Windows installer compilation and release publishing.
