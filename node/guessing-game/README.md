# Number Guessing Game

A command-line number guessing game built with TypeScript and Node.js. The computer picks a random number between 1 and 100, and you try to guess it within a limited number of chances.

Project idea from [roadmap.sh](https://roadmap.sh/projects/number-guessing-game).

## Features

- Three difficulty levels: Easy (10 chances), Medium (5) and Hard (3)
- Hints after each wrong guess: the number is greater or less than your guess
- Input validation: invalid entries don't count as an attempt
- Win message with the number of attempts used; game over message revealing the number

## Requirements

- Node.js 24 or later (LTS recommended)

## Getting started

```bash
git clone https://github.com/InfinityByFrank/Polyglot-backend
cd Polyglot-backend/node/guessing-game
npm install
node index.ts
```

## Example

```
Welcome to the Number Guessing Game!
I'm thinking of a number between 1 and 100.

Please select the difficulty level:
 1. Easy (10 chances)
 2. Medium (5 chances)
 3. Hard (3 chances)

Enter your choice: 2

Great! You have 5 chances to guess the correct number.

Enter your guess: 50
Incorrect! The number is greater than 50.
Enter your guess: 75
Incorrect! The number is less than 75.
Enter your guess: 63
Congratulations! You guessed the correct number in 3 attempt(s).
```

## How it works

- `readline/promises` reads user input without external dependencies.
- `parseIntInRange` validates both the difficulty choice and each guess.
- `playRound` contains the game logic and returns whether the player won.

## Possible improvements

- Play multiple rounds in a row
- Timer to measure how long each round takes
- High score per difficulty level saved to a JSON file
