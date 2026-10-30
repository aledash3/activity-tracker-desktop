# Contributing Guide / Guía de Contribución

## English

Contributions, bug reports, and feature requests are welcome.

### Development Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Install dependencies and verify your changes:
   ```bash
   npm install
   npm run lint
   npm run build
   ```
3. Commit your changes following the **Conventional Commits 1.0.0** specification:
   - `feat(scope): add new capability`
   - `fix(scope): resolve specific bug`
   - `docs(readme): update documentation`
   - `style(ui): refine layout or visual tokens`
   - `refactor(utils): simplify internal calculation`
   - `ci(github): update workflow pipeline`
   - `chore(deps): update build configuration`
4. Push to your fork and submit a Pull Request targeting `main`.

---

## Español

Las contribuciones, reportes de errores y sugerencias de mejora son bienvenidos.

### Flujo de Trabajo

1. Haz un fork del repositorio y crea una rama a partir de `main`:
   ```bash
   git checkout -b feat/nombre-de-tu-mejora
   ```
2. Instala las dependencias y verifica que la compilación y el linter pasen sin errores:
   ```bash
   npm install
   npm run lint
   npm run build
   ```
3. Realiza tus commits en inglés siguiendo el estándar **Conventional Commits 1.0.0**.
4. Envía un Pull Request hacia la rama `main`.
