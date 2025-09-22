## PR Title Validation Update (Shortcut Tickets)

Effective immediately, our PR title checker supports Shortcut ticket references in more flexible positions while still allowing teams to enforce stricter prefix rules when desired.

### Why this change
- Improve alignment with our engineering process and naming conventions
- Ensure clear traceability between PRs and Shortcut tickets (single source of truth)
- Reduce review and release friction by making ticket context obvious from the title
- Encourage healthy lifecycle: enforce one PR per ticket and validate ticket state before merge

### Short announcement (for CC group)
- PR titles must include a Shortcut ticket (e.g., `SC-1234`, `[sc-1234]`, `(#1234)`).
- Only one PR can be linked per ticket; ensure the ticket state is valid before merge.
- Teams may opt for stricter prefix-only or flexible "ticket anywhere" mode.

### What changed
- You can reference tickets anywhere in the title when `enforce_prefix_check: "false"`.
- Supported formats include:
  - `SC-123`, `sc-456`, `SHORTCUT-789` (with or without brackets)
  - Bracketed: `[sc-1234]`, `[SHORTCUT-92675]`
  - In parentheses with hash: `(#12345)`
  - Classic prefixes still work: `1234: Title`, `#1234: Title`, `SC-1234: Title`, `[sc-1234]: Title`

### Valid examples
- `SC-123: Add user authentication`
- `feat: test hotfix [sc-93630]`
- `[Home][SC-94667] Fix: Prevent Blocking the Bottom Area by Footer`
- `feat: [sc-80021] improve handling of dollar-like currencies`
- `sc-89480 feat(feature): Support KMP LP`
- `fix: Give flagged_address more priority for security scanning (#84563)`

### Invalid examples
- `[KMP] fix  deeplink` (no ticket)
- `feat(place-order): fetch balance & update some UI` (no ticket)
- `Return copy button to home screen` (no ticket)
- `feat(perp): add basic models for place order` (no ticket)

### Workflow usage
Default behavior requires a ticket at the start of the title (prefix mode). To allow tickets anywhere:

```yaml
- uses: trustwallet/shortcut-pr-title-checker@v1.1.0
  with:
    github_auth_token: ${{ secrets.GITHUB_TOKEN }}
    github_repo_name: ${{ github.repository }}
    shortcut_auth_token: ${{ secrets.SHORTCUT_AUTH_TOKEN }}
    pr_number: ${{ github.event.pull_request.number }}
    expected_states: "in progress,to do,ready for review"
    enforce_prefix_check: "false"
```

Questions or issues? Ping the maintainers.

### Exclusions (auto-skip titles)
The validator can skip certain routine PRs without a ticket. We recommend excluding:

- `Merge Release x.x.x <>`
- `Bump SDK to x.x.x <>`
- `[Release] x.x.x <>`

Configure via `skip_if_title_contains` (comma-separated, case-insensitive):

```yaml
- uses: trustwallet/shortcut-pr-title-checker@v1.1.0
  with:
    # ... other required inputs
    skip_if_title_contains: "Merge Release,Bump SDK,[Release]"
```

### Customization
- Repos can customize enforcement via workflow inputs:
  - `enforce_prefix_check`: `"true"` (default) for strict prefix; set to `"false"` to allow tickets anywhere.
  - `skip_if_title_contains`: comma-separated list of phrases to auto-skip.
  - `expected_states`: adjust to your team’s workflow states.
- If your team needs different exclusions or states, propose updates in your repo’s workflow.


