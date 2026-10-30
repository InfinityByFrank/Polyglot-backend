import readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process'

interface ParseIntInRange {
  text: string
  min: number
  max: number
}

const DIFFICULTIES = [10, 5, 3]; // easy, medium, hard

async function main() {
  console.log(`Welcome to the Number Guessing Game!\nI'm thinking of a number between 1 and 100.\nYou have 5 chances to guess the correct number.`);
  console.log('\n');
  console.log('Please select the difficulty level: \n 1. Easy (10 chances) \n 2. Medium (5 chances) \n 3. Hard (3 chances)');
  console.log('\n');

  const rl = readline.createInterface({ input, output });
  const maxChances = await selectDifficulty({ rl });
  console.log(`\nGreat! You have ${maxChances} chances to guess the correct number.\n`);

  await playRound({ maxChances, rl });
  rl.close();
}

async function playRound({ maxChances, rl }: { maxChances: number, rl: readline.Interface }) {
  let attempts = 0;
  const secret = Math.floor(Math.random() * 100) + 1;

  while (attempts < maxChances) {
    const guess = parseIntInRange({ text: await rl.question('Enter your guess: '), min: 1, max: 100 })

    if (guess == null) {
      console.log('Enter an integer between 1 and 100.')
      continue;
    }

    attempts++

    if (guess === secret) {
      console.log(`Congratulations! You guessed the correct number in ${attempts} attempts.`)
      return true
    }

    console.log(hint({ guess, secret }))
  }
  
  console.log(`Game over! The number was ${secret}.`);
  return false
}

// Helpers
async function selectDifficulty({ rl }: { rl: readline.Interface}): Promise<number> {
  while(true) {
    const level = parseIntInRange({ text: await rl.question('Enter your choice: '), min: 1, max: 3 });
    if (level !== null) return DIFFICULTIES[level - 1];
    console.log('Enter an integer between 1 and 3.');
  }
}

function hint({ guess, secret }: { guess: number, secret: number }): string {
  return `Incorrect! The number is ${secret > guess ? 'greater' : 'less'} than ${guess} `
}

function parseIntInRange({ text, min, max }: ParseIntInRange): number | null {
  const n = Number(text.trim())
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

main();