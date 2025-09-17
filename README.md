# Shortcut PR Title Validator

A GitHub Action that validates Pull Request titles contain valid Shortcut ticket numbers and checks that the tickets are in expected states.

## Features

- ✅ Validates PR titles contain Shortcut ticket numbers (SC-123, sc-456, SHORTCUT-789, etc.)
- ✅ Optional strict prefix validation (e.g., `1234: title`, `#1234: title`, `sc-1234: title`, `#sc-1234: title`, `[sc-1234]: title`)
- ✅ Optionally enforces single PR for each ticket (via Shortcut API pull_requests.url)
- ✅ Verifies tickets exist in Shortcut via API
- ✅ Checks ticket states against expected values
- ✅ Provides detailed error messages for debugging
- ✅ Sets action outputs with ticket information
- ✅ Reusable across all repositories

## Usage

### Basic Usage

```yaml
name: Validate PR Title
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR Title
        uses: sravanmedarapu/shortcut-pr-title-validator@v1.0.6
        with:
          github_auth_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo_name: ${{ github.repository }}
          shortcut_auth_token: ${{ secrets.SHORTCUT_AUTH_TOKEN }}
          pr_number: ${{ github.event.pull_request.number }}
          expected_states: "in progress,to do,ready for review"
          enforce_prefix_check: "true"   # require prefix formats
          enforce_single_pr_for_each_ticket: "true"  # ensure only one PR linked per ticket
          skip_if_title_contains: "Bump SDK,no ticket for this PR"  # skip validation for these cases
```

### Advanced Usage

```yaml
name: PR Validation Workflow
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Validate PR Title
        id: validate
        uses: sravanmedarapu/shortcut-pr-title-validator@v1.0.6
        with:
          github_auth_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo_name: ${{ github.repository }}
          shortcut_auth_token: ${{ secrets.SHORTCUT_AUTH_TOKEN }}
          pr_number: ${{ github.event.pull_request.number }}
          expected_states: "in progress,ready for review,testing"
      
      - name: Comment on PR
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ PR validated! Ticket: SC-${{ steps.validate.outputs.ticket_id }} - ${{ steps.validate.outputs.ticket_title }}`
            })
```

## Inputs

| Input | Required | Description | Default |
|-------|----------|-------------|---------|
| `github_auth_token` | ✅ | GitHub authentication token with repo access | - |
| `github_repo_name` | ✅ | Repository name in format `owner/repo` | - |
| `shortcut_auth_token` | ✅ | Shortcut API authentication token | - |
| `pr_number` | ✅ | Pull request number to validate | - |
| `expected_states` | ✅ | Comma-separated list of expected Shortcut ticket states | `"in progress,to do,ready for review"` |
| `enforce_prefix_check` | ❌ | Require ticket prefix in PR title (see formats) | `"false"` |
| `enforce_single_pr_for_each_ticket` | ❌ | Ensure only one PR linked per ticket (checks Shortcut API pull_requests.url) | `"true"` |
| `skip_if_title_contains` | ❌ | Comma-separated list of strings to check in PR title. If any string is found, skip validation | `""` |

## Outputs

| Output | Description |
|--------|-------------|
| `ticket_id` | The validated Shortcut ticket ID |
| `ticket_title` | The Shortcut ticket title |
| `ticket_state` | The current state of the Shortcut ticket |
| `skipped` | Whether validation was skipped (true/false) |
| `skip_reason` | Reason for skipping validation (if applicable) |

## Supported Ticket Formats

The action recognizes the following ticket formats in PR titles:

- `SC-123` (uppercase with dash)
- `sc-456` (lowercase with dash)
- `SHORTCUT-789` (full word with dash)
- `shortcut-101` (lowercase full word with dash)
- `SC123` (uppercase without dash)
- `sc456` (lowercase without dash)

When `enforce_prefix_check` is enabled, only the following prefix formats are valid:

- `1234: Title`
- `#1234: Title`
- `sc-1234: Title`
- `#sc-1234: Title`
- `[sc-1234]: Title`
- `SC-1234: Title`
- `SHORTCUT-1234: Title`
- `shortcut-1234: Title`

## Skip Validation

The action can skip validation for PRs with specific title patterns using the `skip_if_title_contains` parameter:

```yaml
skip_if_title_contains: "Bump SDK,no ticket for this PR,chore:"
```

This will skip validation for PRs with titles containing any of these strings (case-insensitive):
- "Bump SDK" → `Bump SDK to v2.1.0`
- "no ticket for this PR" → `no ticket for this PR - quick fix`
- "chore:" → `chore: update dependencies`

When skipped, the action will:
- ✅ Pass the step (no failure)
- 📝 Log the skip reason
- 🔄 Set outputs: `skipped: true`, `skip_reason: "Title contains: ..."`

## Setup

### 1. Create Shortcut API Token

1. Go to your Shortcut account settings
2. Navigate to "API Tokens"
3. Create a new token with appropriate permissions
4. Add the token as a repository secret named `SHORTCUT_AUTH_TOKEN`

### 2. Repository Secrets

Add the following secrets to your repository:

- `SHORTCUT_AUTH_TOKEN`: Your Shortcut API token

### 3. Workflow Permissions

Ensure your workflow has the necessary permissions:

```yaml
permissions:
  contents: read
  pull-requests: read
```

## Error Handling

The action will fail with descriptive error messages for:

- ❌ PR title doesn't contain a valid Shortcut ticket number
- ❌ Shortcut ticket doesn't exist or API error
- ❌ Ticket is not in an expected state
- ❌ Invalid input parameters

## Examples

### Valid PR Titles

- `SC-123: Add user authentication`
- `Fix login bug sc-456`
- `SHORTCUT-789 Implement new feature`
- `Update docs for shortcut-101`
- `1234: Add feature` (prefix format)
- `#1234: Fix bug` (prefix format)
- `sc-1234: Implement feature` (prefix format)
- `[sc-1234]: Update docs` (prefix format)

### Invalid PR Titles

- `Add new feature` (no ticket number)
- `Fix bug` (no ticket number)
- `SC-999: Invalid ticket` (ticket doesn't exist)

## Development

### Building the Action

```bash
npm install
npm run build
```

### Testing

The action can be tested by creating a PR with various title formats and checking the workflow logs.

## License

MIT License - see LICENSE file for details.
