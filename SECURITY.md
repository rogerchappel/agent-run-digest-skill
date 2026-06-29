# Security Policy

## Supported Versions

`agent-run-digest-skill` is pre-1.0. Security fixes are applied to the latest
published package and the `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities through GitHub security advisories or another
private maintainer contact path before sharing details publicly.

Helpful reports include:

- the affected version or commit
- the transcript or fixture shape that triggers the issue
- whether sensitive content can be exposed in Markdown or JSON output
- a minimal reproduction that uses synthetic data

Do not include real credentials, private transcripts, customer names, incident
logs, or other sensitive data in public issues or fixtures.

## Scope

This tool reads local run logs and writes deterministic reports to stdout.
Security reports are most useful when they involve unintended file access,
redaction bypasses, unsafe package contents, or output that could misrepresent
heuristic summaries as verified facts.
