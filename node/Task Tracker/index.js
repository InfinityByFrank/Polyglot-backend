import { readFile, writeFile } from 'node:fs/promises'

const FILE = 'task.json';
const STATUS_VALUES = ['todo', 'in-progress', 'done'];

async function main() {
  try {
    const [command, ...rest] = process.argv.slice(2);

    if (command === 'add') {
      await add(rest);
    } else if (command === 'list') {
      await list(rest);
    } else if (command === 'update') {
      await update(rest);
    } else if (command === 'mark') {
      await mark(rest);
    } else if (command === 'mark-in-progress') {
      await mark([...rest, 'in-progress']);
    } else if (command === 'mark-done') {
      await mark([...rest, 'done']);
    } else if (command === 'delete') {
      await deleteOne(rest);
    } else {
      console.error('unknown command');
    }
  } catch (error) {
    console.error('Usage: task-cli <add|list|update|mark-in-progress|mark-done|delete>'); 
    process.exitCode = 1;
  }
}

// Commands
async function add(parts) {
  const description = parts.join(' ').trim();
  if (!description) throw new Error('Usage: task-cli add "description"')

  if (!description || !description.trim()) throw new Error('Usage: taks-cli add "description');

  const tasks = await readTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const now = new Date().toISOString();

  const task = {
    id: nextId,
    status: 'todo', // 'todo', 'in-progress', 'done'
    description,
    createdAt: now,
    updatedAt: now,
  }

  // Save
  await saveTasks([...tasks, task]);
  console.log(`Task added successfully (ID: ${nextId})`);
}

async function list([status]) {
  if (status && !STATUS_VALUES.includes(status)) throw new Error(`Status must be one of: ${STATUS_VALUES.join(', ')}`);

  const tasks = await readTasks();
  const filtered = status ? tasks.filter((t) => t.status === status) : tasks

  if (filtered.length === 0) {
    console.log(status ? `No tasks with status: "${status}"` : 'No tasks yet')
    return
  }

  renderList(filtered);
}

function renderList(tasks) {
  const rows = tasks.map((t) => ({
    ID: t.id,
    Description: t.description,
    Status: t.status,
    Created: new Date(t.createdAt).toLocaleString('es-MX'),
    Updated: new Date(t.updatedAt).toLocaleString('es-MX'),
  }));

  console.table(rows);
}

async function update([rawId, ...prop]) {
  const id = parseId(rawId);

  const description = prop.join(' ').trim();
  if (!description) throw new Error('Usage: task-cli update <id> "new description"');

  await updateTask(id, { description })
  console.log(`Task ${id} updated successfully`)
}

async function mark([rawId, status]) {
  if (!STATUS_VALUES.includes(status)) throw new Error(`Status must be one of: ${STATUS_VALUES.join(', ')}`);
  const id = parseId(rawId);
  await updateTask(id, { status });
  console.log(`Task ${id} marked as ${status}`)
}

async function updateTask(id, changes) {
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error(`Task ${id} not found.`);

  tasks[index] = {
    ...tasks[index],
    ...changes,
    updatedAt: new Date().toISOString()
  }

  await saveTasks(tasks);
}

async function deleteOne([rawId]) {
  const id = parseId(rawId);
  const tasks = await readTasks();
  
  const remaining = tasks.filter((current) => current.id !== id);
  if (remaining.length === tasks.length) throw new Error(`Task ${id} not found.`);

  await saveTasks(remaining);
  console.log(`Task ${id} deleted successfully`)
}

// Helpers
async function saveTasks(tasks) {
  await writeFile(FILE, JSON.stringify(tasks, null, 2));
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error('The ID must be a positive integer')
  return id
}

async function readTasks() {
  let raw;

  try {
    raw = await readFile(FILE, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  try {
    const tasks = JSON.parse(raw);
    if (!Array.isArray(tasks)) throw new Error();
    return tasks;
  } catch (error) {
    throw new Error(`${FILE} is corruped. Fix it or delete it to start over.`)
  }
}

main();