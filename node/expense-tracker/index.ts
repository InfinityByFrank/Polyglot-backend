import { readFile, writeFile } from 'node:fs/promises'

interface Expense {
  id: number,
  date: string,
  description: string,
  amount: number
}

interface ExpenseFile {
  count_id: number
  data: Expense[]
}

const FILE = 'expenses.json';

async function main() {
  try {
    const [command, ...rest] = process.argv.slice(2) as string[];

    if (command === 'add') {
      await add(rest);
    } else if (command === 'list') {
      await list();
    } else if (command === 'update') {
      await update(rest);
    } else if (command === 'delete') {
      await deleteOne(rest);
    } else if (command === 'summary') {
      await summary(rest);
    } else throw new Error("ExpenseTracker: Commands doesn't exist")

  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
}

// Command
async function add(args: string[]) {
  const description = parseDescription(getFlag(args, '--description')) 
  const amount = parseAmount((getFlag(args, '--amount')))

  const { id } = await handleSave({ description: description ?? '', amount })
  console.log(`Expense added successfully (ID: ${id})`)
}

async function list() {
  const { data } = await readRecord();
  if (data.length === 0) return console.log('No expenses found');

  console.log('ID  Date        Description  Amount');
  for (const e of data) {
    console.log(`${String(e.id).padEnd(3)} ${e.date.slice(0, 10)}  ${e.description.padEnd(12)} $${e.amount}`)
  }
}

async function summary(args: string[]) {
  const { data } = await readRecord();
  const monthFlag = getFlag(args, '--month')

  let expenses = data;
  let label = 'Total expenses';

  if (monthFlag !== undefined) {
    const month = Number(monthFlag);
    if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('--month must be a number between 1 and 12');

    const year = new Date().getFullYear();
    expenses = data.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })

    const name = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
    label = `Total expenses for ${name}`
  }

  const total = expenses.reduce((acc, val) => acc + val.amount, 0)
  console.log(`${label}: $${total.toFixed(2)}`)
}

async function update(args: string[]) {
  const id = parseId(getFlag(args, '--id'));
  const descriptionFlag = getFlag(args, '--description')
  const amountFlag = getFlag(args, '--amount');

  if (descriptionFlag === undefined && amountFlag === undefined) 
    throw new Error('Provide --description and/or --amount to update');

  const file = await readRecord();
  const expense = file.data.find((e) => e.id === id);
  if (!expense) throw new Error(`Expense with ID ${id} doesn not exist`)

  if (descriptionFlag !== undefined) expense.description = parseDescription(descriptionFlag);
  if (amountFlag !== undefined) expense.amount = parseAmount(amountFlag);

  await saveRecord(file)
  console.log('Expense update successfylly')
}

async function deleteOne(args: string[]) {
  const id = parseId(getFlag(args, '--id'))

  const file = await readRecord();

  const remaining = file.data.filter((val) => val.id !== id);
  if (remaining.length === file.data.length) throw new Error(`Expense with ID ${id} does not exist`)

  await saveRecord({
    count_id: file.count_id,
    data: remaining
  })

  console.log('Expense deleted successfully')
}

// -- helpers --
function getFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined
  return args[index + 1]
}

async function readRecord():Promise<ExpenseFile> {
  try {
    const raw = await readFile(FILE, 'utf-8')
    return JSON.parse(raw) as ExpenseFile
  } catch (error: any) {
    if (error.code === 'ENOENT') return { count_id: 0, data: [] }
    if (error instanceof SyntaxError) throw new Error(`${FILE} is corrupted. Fix it or delete it to start over.`)
    throw error
  }
}

async function handleSave({ description, amount }: { description: string, amount: number }) {
  const file = await readRecord();
  const id = file.count_id + 1;

  await saveRecord({
    count_id: id,
    data: [...file.data, buildRecord({ description, amount, id })]
  })

  return { id }
}

function buildRecord({ description, amount, id }: { description: string, amount: number, id: number }): Expense {
  return ({ id, date: new Date().toISOString(), description, amount })
}

function parseDescription(value: string | undefined): string {
  const description = value?.trim();
  if (!description) throw new Error('--description is required');
  return description
}

function parseAmount(value: string | undefined): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('--amount must be a positive number')
  return amount
}

async function saveRecord(file: ExpenseFile) {
  await writeFile(FILE, JSON.stringify(file, null, 2))
}

function parseId(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error('The ID must be a positive integer');
  return id;
}

main();