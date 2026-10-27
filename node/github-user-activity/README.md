# GitHub User Activity CLI

A small command-line tool that fetches a GitHub user's recent public activity and prints it in a readable format. Built with TypeScript and Node.js, with **no external dependencies**.

This project is based on the [GitHub User Activity](https://roadmap.sh/projects/github-user-activity) challenge from [roadmap.sh](https://roadmap.sh).

## Features

- Fetches recent public events from the GitHub REST API
- Human-readable output, one line per event, with relative timestamps ("2 hours ago")
- Optional filter by event type (`--type`)
- Clear error messages for unknown users, rate limits and network failures
- Zero runtime dependencies: uses Node's built-in `fetch` and `Intl.RelativeTimeFormat`

## Requirements

- [Node.js](https://nodejs.org/) 18 or higher

## Installation

```bash
git clone https://github.com/InfinityByFrank/Polyglot-backend
cd Polyglot-backend/node/github-user-activity
npx tsx index.ts InfinityByFrank --type=PushEvent
```

### Optional: use it as a global command

Make sure `package.json` includes a `bin` entry pointing to the compiled file:

```json
{
  "bin": {
    "github-activity": "dist/index.js"
  }
}
```

Then link it:

```bash
npm link
```

To remove it later:

```bash
npm unlink -g github-activity
```

## Usage

```bash
github-activity <username> [--type=<EventType>]
```

If you haven't linked the command, you can run it directly:

```bash
node dist/index.js <username> [--type=<EventType>]
```

### Examples

Show the latest activity for a user:

```bash
github-activity InfinityByFrank
```

Show only push events:

```bash
github-activity InfinityByFrank --type=PushEvent
```

### Sample output

```
Recent activity for InfinityByFrank:

- Pushed to main in InfinityByFrank/Hello-World (2 hours ago)
- Starred InfinityByFrank/Spoon-Knife (yesterday)
- Opened an issue in InfinityByFrank/Hello-World (3 days ago)
- Created branch "feature-x" in InfinityByFrank/Hello-World (3 days ago)
```

## Supported events

| Event type    | Output                                |
| ------------- | ------------------------------------- |
| `PushEvent`   | `Pushed to <branch> in <repo>`        |
| `IssuesEvent` | `<Action> an issue in <repo>`         |
| `WatchEvent`  | `Starred <repo>`                      |
| `CreateEvent` | `Created <branch/tag/repo> in <repo>` |
| Any other     | `<EventType> in <repo>`               |

The `--type` filter is case-insensitive and works with any GitHub event type, including ones that use the generic output format.

## Error handling

| Situation                  | Behavior                                         |
| -------------------------- | ------------------------------------------------ |
| No username provided       | Prints the usage message and exits with code 1   |
| User not found (404)       | `User: <username> not found`                     |
| API error (e.g. rate limit)| Prints the status code and GitHub's message      |
| Network failure            | `Could not reach GitHub. Check your connection.` |
| No events (or none match)  | Prints a message instead of failing              |

## Notes and limitations

- **Rate limit:** unauthenticated requests to the GitHub API are limited (60 per hour per IP).
- **Event count:** the API returns up to 30 recent events by default.
- **Push events:** GitHub's Events API no longer includes the list of commits in `PushEvent` payloads, so the tool shows the branch that was pushed to rather than a commit count.
- Only **public** activity is available.

## How it works

1. Reads the username and optional `--type` flag from the command-line arguments.
2. Requests `https://api.github.com/users/<username>/events`, encoding the username with `encodeURIComponent`.
3. Narrows each event with a TypeScript discriminated union (`GitHubEvent`) and formats it with a `switch` on `event.type`.
4. Converts each timestamp to a relative time with `Intl.RelativeTimeFormat`.

## Possible improvements

- Support more event types (`PullRequestEvent`, `ForkEvent`, ...)
- Show commit counts using the compare endpoint
- Pagination or a `--limit` flag
- Optional authentication with a GitHub token to raise the rate limit
- Caching responses for a short period
