# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-10-30

### Added
- Support for multiple requesters per activity (`solicitantes`):
  - In `ActivityModal`, assign one or more requesters per activity using interactive chip tags with removal actions.
  - Quick-suggestion buttons populated dynamically from the supervisor profile and previously registered requesters.
  - Datalist autocomplete for adding new requesters on Enter key or button click.
  - Backward compatibility: automatically normalizes single-requester strings, arrays, or comma-separated lists across board cards, reports, and exports.
- Full automated data backup of all 18 registered activities and custom user profile (`backups/backup_completo_bitacora_2026-10-30.json`), automatically loaded into the new app version.

### Removed
- Removed Categories (`categorias`) feature entirely from the interface:
  - Removed "Categorías" button from navbar.
  - Removed `CatalogModal` component and category selector in `ActivityModal`.
  - Removed Category column and tags from `ActivityCard`, `ReportsModal`, PDF export, Excel (`.xlsx`) export, and CSV export.

## [1.2.3] - 2026-10-30

### Fixed
- Fixed reactivity and calculation of completed hours vs total registered hours in `WeekNavigator`:
  - Progress bar now tracks completed hours against weekly target quota (`horasCompletadas / metaActiva`) rather than premature 100% full bar when uncompleted hours remain.
  - Quota message dynamically computes `metaActiva - horasCompletadas` (e.g. `Restan 4h para completar la meta`) and only displays `Meta semanal completada` when all target hours are completed.
  - Footer count clarifies partial completion (e.g. `16h completadas (13 de 14 actividades)` instead of ambiguous `(14 actividades)`).
  - Fixed `handleToggleEstado` to directly switch between `completado` and `pendiente` without cycling into hidden `en_progreso` state that prevented completed hours from incrementing.
  - Added `useEffect` and dynamic `key` synchronization to `ActivityModal` so form inputs immediately reflect the edited activity and date.

## [1.2.2] - 2026-10-30

### Fixed
- Fixed weekly hour metrics mismatch in `WeekNavigator`: aligned property names between `metricasSemana` (`horasTotales` vs `totalHoras`) so that the header progress indicator accurately displays the active weekly hours (e.g. `20h de 20h`) instead of falling back to `0h`.

## [1.2.1] - 2026-10-30

### Fixed
- Resolved `TypeError: n.has is not a function` runtime error in `diasVisiblesSemana` when opening the Reports modal. Made date collection check defensive supporting both `Set` and `Array` collections, ensuring the Reports modal renders smoothly without crashing.

## [1.2.0] - 2026-10-30

### Added
- Native file export and download handler: integrated `@tauri-apps/plugin-dialog` and native Rust IPC file writing (`guardar_archivo`), resolving WebView2 `<a download>` blocking and allowing users to save files directly to any destination on their filesystem.
- Microsoft Excel (`.xlsx`) export and import: structured spreadsheet generation with metadata headers, net hour formulas, and requester breakdown powered by `write-excel-file` and `read-excel-file`.
- Universal data import: seamless loading of `.xlsx`, `.csv`, and `.json` files via the navbar upload button with automatic schema detection and non-destructive activity merging.
- Variable interface zoom: controllable via `Ctrl + Mouse Wheel` and dedicated navbar buttons (`[-]`, `[100%]`, `[+]`) next to the theme toggle, scaled smoothly from 70% to 160% and persisted in `localStorage`.
- Dedicated Export Modal (`ExportModal`): download picker for Excel (.xlsx), PDF (.pdf), CSV (.csv), and JSON backups with options for full history or current week scope.

### Fixed
- Reports modal scrolling: added `min-height: 0` flex constraints, sticky table headers, and custom scrollbar styling, allowing users to scroll through all recorded activities smoothly without content truncation.
- Preserved current week activity data and user profile across app updates.

## [1.1.0] - 2026-10-30

### Added
- Configurable working days (`dias_laborables`): select any combination of Monday to Sunday, rendering one full-height board column per active working day.
- Dynamic per-day lunch schedules (`recesos`): define multiple lunch windows assigned to specific groups of days (e.g., Monday to Wednesday `13:00` to `14:00` and Thursday to Friday `12:00` to `12:30`), displayed automatically in the weekly board and subtracted from overlapping activities.
- Activity requester field (`solicitante`) with autocomplete suggestions from previous entries and the configured supervisor, included in board cards, report previews, PDF reports, and CSV exports.
- Native lightweight desktop runtime powered by **Tauri v2** and **Rust** (`src-tauri/`), producing a compact Windows NSIS installer and standalone executable backed by Windows WebView2.

### Changed
- Migrated legacy single-interval break settings (`receso_inicio`, `receso_fin`, `receso_minutos`) automatically into multi-rule lunch schedules.
- Improved validation feedback when an activity interval falls entirely inside a configured lunch window.

## [1.0.0] - 2026-10-30

### Added
- Weekly activity board with full-viewport layout and quick-add actions.
- Automatic daily break deduction for effective hour calculations.
- Weekly hour target configuration (`meta_horas_semanales`) with real-time progress bar and completion indicators.
- Visual and calligraphy customization studio (`AppearanceModal`) supporting Light/Dark mode, 6 curated color palettes, custom HEX color picker, 7 typography and calligraphy options, font scaling, and border radius presets.
- Executive PDF report generator (`jsPDF` + `jspdf-autotable`) with institutional header, dynamic accent color, activity breakdown, and dual signature blocks.
- Excel-compatible UTF-8 BOM CSV export and full JSON backup export/import.
- Automated GitHub Actions workflow (`desktop-release.yml`) for Windows installer compilation and release publishing.
