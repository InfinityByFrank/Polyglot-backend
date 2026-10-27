# Task Tracker CLI

A simple command line app to track your tasks and manage your to-do list. Built with plain Node.js, with **no external dependencies**. Tasks are stored in a local JSON file.

This project is a solution to the [Task Tracker](https://roadmap.sh/projects/task-tracker) challenge from [roadmap.sh](https://roadmap.sh/backend/projects).

## Features

- Add, update, and delete tasks
- Mark a task as `in-progress` or `done`
- List all tasks, or filter them by status (`todo`, `in-progress`, `done`)
- Persistent storage in a `task.json` file (created automatically if it doesn't exist)
- Input validation and clear error messages

## Requirements

- [Node.js](https://nodejs.org/) 18 or higher

## Installation

```bash
git clone https://github.com/InfinityByFrank/Polyglot-backend
cd Polyglot-backend/node/task-tracker
node index.js <command>
```

No `npm install` needed: the project only uses Node's built-in modules (`node:fs/promises`).

## Usage

Run the CLI with `node index.js <command> [arguments]`.

### Add a task

```bash
node index.js add "Buy groceries"
# Task added successfully (ID: 1)
```

### Update a task description

```bash
node index.js update 1 "Buy groceries and cook dinner"
# Task 1 updated successfully
```

### Delete a task

```bash
node index.js delete 1
# Task 1 deleted successfully
```

### Change a task status

```bash
node index.js mark-in-progress 1
# Task 1 marked as in-progress

node index.js mark-done 1
# Task 1 marked as done
```

You can also set the status explicitly with `mark <id> <status>`, where status is `todo`, `in-progress`, or `done`:

```bash
node index.js mark 1 todo
```

### List tasks

```bash
node index.js list              # all tasks
node index.js list todo         # tasks not started yet
node index.js list in-progress  # tasks in progress
node index.js list done         # completed tasks
```

Example output:

```
┌─────────┬────┬───────────────────────────────┬─────────────┬─────────────────────┬─────────────────────┐
│ (index) │ ID │ Description                   │ Status      │ Created             │ Updated             │
├─────────┼────┼───────────────────────────────┼─────────────┼─────────────────────┼─────────────────────┤
│ 0       │ 1  │ 'Buy groceries and cook dinner' │ 'in-progress' │ '26/10/2026, 10:30:00' │ '26/10/2026, 11:15:00' │
└─────────┴────┴───────────────────────────────┴─────────────┴─────────────────────┴─────────────────────┘
```

## Task structure

Each task is saved in `task.json` with these properties:

| Property      | Description                                          |
| ------------- | ---------------------------------------------------- |
| `id`          | Unique incremental identifier                        |
| `description` | Short description of the task                        |
| `status`      | `todo`, `in-progress`, or `done`                     |
| `createdAt`   | ISO date when the task was created                   |
| `updatedAt`   | ISO date when the task was last modified             |

```json
[
  {
    "id": 1,
    "description": "Buy groceries and cook dinner",
    "status": "in-progress",
    "createdAt": "2026-10-26T16:30:00.000Z",
    "updatedAt": "2026-10-26T17:15:00.000Z"
  }
]
```

## Error handling

The CLI exits with code `1` and prints a message when something goes wrong, for example:

- Missing or empty description
- Invalid or non-existent task ID
- Invalid status value
- Unknown command
- `task.json` is empty or contains invalid JSON

## Notes

- IDs are incremental (highest existing ID + 1), so the ID of a deleted task can be reused if it was the last one.
- The `task.json` file is created in the directory where you run the command.

## What I learned

- Reading command line arguments with `process.argv`
- Working with the file system using Node's native `fs/promises` module
- Structuring a small CLI: command handlers, helpers, and validation
- Handling errors and edge cases without external libraries
