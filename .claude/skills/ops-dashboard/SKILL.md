```markdown
# ops-dashboard Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `ops-dashboard` TypeScript codebase. You'll learn how to structure files, write imports/exports, follow commit conventions, and implement and test features using the established patterns. This guide is ideal for contributors seeking to maintain consistency and quality in the project.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.tsx`, `dashboardData.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import userService from './userService';
    import { fetchData } from '../utils/dataFetcher';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```typescript
    // userService.ts
    const userService = { /* ... */ };
    export default userService;
    ```

### Commit Messages
- Follow **Conventional Commits** with the `feat` prefix for new features.
  - Example:
    ```
    feat: add real-time updates to dashboard widgets
    ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature to the dashboard  
**Command:** `/feature-development`

1. Create a new file using camelCase naming.
2. Implement the feature using TypeScript.
3. Use relative imports to include dependencies.
4. Export your module using a default export.
5. Write corresponding tests in a `.test.tsx` file.
6. Commit your changes with a `feat:` prefix and a concise description.

#### Example:
```typescript
// newWidget.tsx
const NewWidget = () => { /* ... */ };
export default NewWidget;
```
```typescript
// newWidget.test.tsx
import NewWidget from './newWidget';
test('renders correctly', () => { /* ... */ });
```
```
git commit -m "feat: add new widget component"
```

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Write tests in files matching the `*.test.tsx` pattern.
2. Use Jest as the testing framework.
3. Run tests using the project's test script (e.g., `npm test` or `yarn test`).

#### Example:
```typescript
// dashboardData.test.tsx
import dashboardData from './dashboardData';

test('fetches data correctly', () => {
  // test implementation
});
```

## Testing Patterns

- All tests are written using **Jest**.
- Test files follow the `*.test.tsx` naming convention.
- Place test files alongside the modules they test or in a dedicated `__tests__` directory.
- Example test:
  ```typescript
  import userService from './userService';

  test('returns user data', () => {
    expect(userService.getUser()).toBeDefined();
  });
  ```

## Commands

| Command              | Purpose                                    |
|----------------------|--------------------------------------------|
| /feature-development | Step-by-step guide for adding new features |
| /run-tests           | Instructions for running the test suite    |
```
