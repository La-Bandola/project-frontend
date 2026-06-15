---
name: vue-frontend-expert
description: Expert guidance for Vue.js, JavaScript, and TypeScript development. Use when creating or refactoring Vue components, composables, writing Jest tests, or debugging frontend logic. Follows modern Vue patterns (Composition API) and strict clean code standards.
---

# Vue & Frontend Expert

## Overview
This skill provides expert guidance for frontend development using Vue.js, modern JavaScript, and TypeScript. It covers component architecture, clean code principles, separation of concerns, and testing with Jest to ensure robust and maintainable frontend applications.

## Instructions

When responding to frontend requests, always evaluate and apply the following standards before writing code:

### 1. Vue & Clean Code Standards
- **Composition API:** Prefer `<script setup>` and the Composition API for all new Vue components.
- **Separation of Concerns (Thin Components):** UI components should only handle presentation. Extract stateful business logic into decoupled `composables` (e.g., `useUser()`) and pure functions into utility files.
- **Single Responsibility Principle (SRP):** Components and functions should do exactly one thing. Break down large, monolithic components into smaller, reusable pieces.
- **TypeScript & Safety:** Use strict typing for props, emits, and reactive state. Avoid the `any` type at all costs. Define clear `Interfaces` or `Types`.
- **Naming Conventions:** Use PascalCase for components (`UserProfile.vue`), camelCase for composables/functions, and descriptive, intention-revealing names for variables. Avoid abbreviations.
- **Magic Values:** Do not use magic strings or numbers directly in the template or script; extract them to named constants.

### 2. Testing Strategies (Jest)
- **Test Structure:** Name test files with `.test.ts` or `.test.js` suffix. Use descriptive test names with nested `describe` blocks (`describe('Component', () => { it('should do X', () => {}) })`).
- **Effective Mocking:** Isolate tests by mocking external dependencies (APIs, databases). Use `jest.mock()`, `jest.spyOn()`, and reset mocks between tests with `jest.resetAllMocks()` in `afterEach`.
- **Async Code:** Always return promises or use async/await syntax in tests. Use `resolves`/`rejects` matchers.
- **Component Testing:** Test user behavior and component accessibility rather than implementation details.
- **Matchers:** Use precise matchers (e.g., `toBeTruthy()`, `toHaveProperty()`, `toHaveBeenCalledWith()`).

### 3. Quality Checklist (Final Output)

At the end of every response, you must provide a concise quality checklist using ✅ (Green/Pass) or ❌ (Red/Fail or Needs Attention) evaluating the provided solution against these core requirements:

- ✅/❌ **Clean Code & SRP:** Functions and components are small, readable, and have a single responsibility.
- ✅/❌ **Architecture (Composables):** Business logic is decoupled from the UI and extracted into composables or utility functions.
- ✅/❌ **TypeScript/Typing:** Interfaces and types are explicitly defined, strictly avoiding `any` and implicit typings.
- ✅/❌ **Testing & Mocks:** Jest best practices are followed, logic is testable, and dependencies are properly mocked.