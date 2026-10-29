# Expense Tracker CLI

A simple command-line app to manage your expenses, built with Node.js and TypeScript. No external dependencies for the app logic: data is stored in a local JSON file.

This project is based on the [Expense Tracker](https://roadmap.sh/projects/expense-tracker) challenge from [roadmap.sh](https://roadmap.sh).

## Features

- Add an expense with a description and an amount
- Update an existing expense
- Delete an expense
- List all expenses
- View a summary of all expenses
- View a summary of expenses for a specific month (of the current year)
- Input validation and clear error messages

## Requirements

- [Node.js](https://nodejs.org/) 18 or higher

## Installation

```bash
git clone https://github.com/InfinityByFrank/Polyglot-backend
cd Polyglot-backend/node/expense-tracker
node index.ts <command>
```

## Usage

All commands are run from the project folder. In the examples below, `expense-tracker` stands for:

```bash
npx tsx src/index.ts
```

> Adjust the path if your entry file is in a different place.

### Add an expense

```bash
node index.ts add --description "Lunch" --amount 20
# Expense added successfully (ID: 1)
```

### List all expenses

```bash
node index.ts list
# ID  Date        Description  Amount
# 1   2026-10-29  Lunch        $20
# 2   2026-10-29  Dinner       $10
```

### Update an expense

You can update the description, the amount, or both:

```bash
node index.ts update --id 1 --amount 25
# Expense updated successfully

node index.ts update --id 1 --description "Business lunch" --amount 30
# Expense updated successfully
```

### Delete an expense

```bash
node index.ts delete --id 2
# Expense deleted successfully
```

### Summary

```bash
node index.ts summary
# Total expenses: $30.00

node index.ts summary --month 10
# Total expenses for October: $30.00
```

The `--month` option takes a number from 1 to 12 and uses the current year.

## Data storage

Expenses are saved in an `expenses.json` file in the folder where you run the command. The file is created automatically the first time you add an expense.

```json
{
  "count_id": 2,
  "data": [
    {
      "id": 1,
      "date": "2026-10-29T18:30:00.000Z",
      "description": "Lunch",
      "amount": 20
    }
  ]
}
```

- `count_id` is the last ID that was assigned. IDs are never reused, even if you delete an expense.
- If `expenses.json` is corrupted, the app shows an error instead of overwriting your data.

## Error handling

The app validates its input and exits with an error message when:

- `--description` is missing or empty
- `--amount` is missing, not a number, zero, or negative
- `--id` is not a positive integer, or the expense does not exist
- `--month` is not a number between 1 and 12
- `update` is called without `--description` or `--amount`
- the command does not exist

## Project structure

```
.
├── src/
│   └── index.ts       # CLI commands and helpers
├── expenses.json      # Created automatically (ignored by git)
├── package.json
└── README.md
```

## Roadmap

- [ ] Expense categories and filtering by category
- [ ] Monthly budget with a warning when it is exceeded
- [ ] Export expenses to CSV

## What I practiced

- Reading and writing files with `node:fs/promises`
- Parsing command-line arguments
- Validating input and handling errors in one central place
- Working with dates and grouping data by month
