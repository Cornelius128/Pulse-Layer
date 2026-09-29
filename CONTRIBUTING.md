# Contributing to PulseLayer

Thank you for contributing to PulseLayer. This project is designed to be a transparent, open-source infrastructure layer for Stellar trust intelligence, and we expect contributions to reflect that standard.

This repository is built for public review, reproducibility, and ecosystem value. Contributors should aim for clear implementation, careful validation, and documentation that supports both human review and AI-assisted evaluation.

---

## Contribution principles

We value contributions that improve the project in ways that are:

- technically sound
- security-conscious
- clear and well-documented
- aligned with the project’s mission of transparent Stellar risk intelligence
- easy to review through a pull request

The default standard for any meaningful change is:

- open discussion or issue tracking first when it is a feature or bug fix
- a focused branch for the work
- a pull request that explains the rationale, scope, and verification evidence

---

## How to contribute

### 1. Open or review an issue

Before starting work, check whether the task is already discussed in the repository.

Good issues include:

- bug reports with reproduction steps
- feature proposals with clear user value
- technical debt or refactoring tasks
- security concerns that need assessment
- performance, reliability, or observability improvements

When opening an issue, include:

- the problem statement
- expected behavior
- actual behavior
- reproduction steps
- environment details (OS, Node version, browser if relevant)
- screenshots or logs when helpful

### 2. Fork and branch

```bash
git clone https://github.com/Justice989810/Pulse-Layer.git
cd Pulse-Layer
git checkout -b feature/your-change-name
```

Use concise, descriptive branch names such as:

- `feature/scoring-threshold-tuning`
- `fix/ledger-ingest-bug`
- `docs/grant-readiness-update`
- `refactor/api-response-structure`

---

## Local development workflow

```bash
npm install
npm run dev
```

Relevant validation commands:

```bash
npm run build
npm run lint
```

If your change affects the analysis logic or API behavior, validate it with the most relevant local checks and document the output in your pull request.

---

## Coding expectations

We expect contributors to follow the project’s spirit and technical standards:

- prefer clear and maintainable TypeScript
- keep logic deterministic and explainable whenever possible
- avoid unnecessary complexity
- preserve security boundaries and read-only data access patterns
- support accessibility and usability in the UI
- document public-facing behavior and architecture changes

### Backend expectations

- use parameterized queries for SQLite operations
- avoid exposing sensitive data or unsafe runtime behavior
- keep API responses consistent and predictable
- validate assumptions around network data before merging

### Frontend expectations

- maintain simple, readable component structure
- keep the dashboard responsive and compatible with dark/light themes
- ensure the UI remains understandable to users who are not technical experts

### Documentation expectations

If your change alters user workflows, architecture, security assumptions, or project value, update the relevant documentation in the same pull request.

---

## Pull request standards

All substantive changes should be submitted as a pull request.

The pull request should include:

1. A clear title describing the change
2. A summary of the problem and the solution
3. The files affected
4. Verification steps and evidence
5. Any risks, follow-up tasks, or open questions

### PR checklist

Before requesting review, confirm:

- [ ] the branch is focused and scoped
- [ ] the code builds successfully
- [ ] relevant validation checks have been run
- [ ] documentation was updated if needed
- [ ] the change is easy to review and explain
- [ ] no secrets or sensitive credentials were added

### Suggested PR template

```md
## Summary
Describe the issue and the reason for the change.

## What changed
- bullet list of updates

## Why this matters
Explain the user, technical, or ecosystem impact.

## Verification
- `npm run build`
- `npm run lint`
- any additional manual validation

## Notes
Mention follow-up items or risk areas.
```

---

## Review expectations

Contributors should be prepared for constructive feedback. Good review conversations focus on:

- correctness
- clarity
- maintainability
- security
- real user value
- fit with the project mission

We aim for quality over speed and for open review over opaque approval.

---

## Security reporting

If you discover a vulnerability, please do not open a public issue that exposes the details. Use the repository security reporting process and follow the guidance in [SECURITY.md](SECURITY.md).

---

## Final note

PulseLayer is a public utility project with value to the Stellar ecosystem. Contributions that improve trust, usability, reliability, and transparency are especially welcome. We expect contributors to work in the open, document their reasoning, and submit changes in reviewable pull requests.
