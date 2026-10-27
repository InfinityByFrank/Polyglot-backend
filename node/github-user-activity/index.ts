#!/usr/bin/env node

interface BaseEvent {
  id: string;
  repo: { id: number; name: string; url: string };
  actor: { login: string };
  public: boolean;
  created_at: string;
}

interface ErrorResponse {
  message: string,
  documentation_url: string
  status?: string
}

type GitHubEvent =
  | (BaseEvent & { type: 'PushEvent'; payload: { ref: string; head: string; before: string } })
  | (BaseEvent & { type: 'IssuesEvent'; payload: { action: string } })
  | (BaseEvent & { type: 'WatchEvent'; payload: { action: string } })
  | (BaseEvent & { type: 'CreateEvent'; payload: { ref_type: string; ref: string | null } });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function main() {
  try {
    const args = process.argv.slice(2) as string[];
    const username = args.find((a) => !a.startsWith('--'))?.trim();
    const type = args.find((value) => value.startsWith('--type='))?.split('=')[1];

    if (!username) throw new Error('Usage: github-activity <username> [--type=PushEvent]');

    await showActivity(username, type);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Command
async function showActivity(username: string, type?: string) {
  let res: Response

  try {
    res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events`, {
      method: 'GET',
      headers: { 'User-Agent': 'github-activity-cli' }
    })
  } catch (error) {
    throw new Error('Could not reach GitHub. Check your connection...')
  }

  if (res.status == 404) throw new Error(`User: ${username} not found`);
  if (!res.ok) {
    const err = (await res.json()) as ErrorResponse
    throw new Error(`Github error ${res.status}: ${err.message}`)
  }

  let events = await res.json() as GitHubEvent[]
  if (type) events = events.filter((e) => e.type.toLowerCase() === type.toLowerCase())
  if (events.length === 0) return console.log(`${username} has no recent public activity.`);

  console.log(`Recent actitivy for ${username}: \n`)
  events.forEach((item) => console.log(`- ${formatEvent(item)} (${timeAgo(item.created_at)})`))
}

// Helpers
function formatEvent(event: GitHubEvent): string {
  if (event.type === 'PushEvent') return `Pushed to ${event.payload.ref.replace('refs/heads/', '')} in ${event.repo.name}`
  else if (event.type === 'IssuesEvent') return `${capitalize(event.payload.action)} as issue in ${event.repo.name}`
  else if (event.type === 'WatchEvent') return `Starred ${event.repo.name}`
  else if (event.type === 'CreateEvent') {
    const name = event.payload.ref ? `"${event.payload.ref}"` : '';
    return `Create ${event.payload.ref_type}${name} in ${event.repo.name}`
  }
  
  else {
    const other = event as BaseEvent & { type: string }
    return `${other.type} in ${other.repo.name}`
  }
}

function timeAgo(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ]

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second')
}

main();