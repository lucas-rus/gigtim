import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REFINE_SCRIPT = path.join(__dirname, 'refine-design.mjs');

const SCREENS_TO_REFINE = [
  {
    id: '5229042293481769989',
    name: 'Register Screen',
    prompt: 'Refine the register screen to use a multi-step dark glassmorphic card layout, matching the premium login page, with animated gradients and Outfit heading font.'
  },
  {
    id: '17359297065720208440',
    name: 'Jobs Marketplace',
    prompt: 'Upgrade the Jobs Marketplace page. Use the Labor Efficient Modernist light-mode styling with Deep Romanian Blue (#002b7f), clean grid of cards with 1px border, JetBrains Mono font for status tags, and proper filtering panel.'
  },
  {
    id: '15104110539341829597',
    name: 'Shifts Management',
    prompt: 'Upgrade the Shifts Management page to match the premium modernist aesthetic. Use clean card lists, clear status indicators, and sleek tab selectors.'
  },
  {
    id: '15392660530864485030',
    name: 'User Profile',
    prompt: 'Upgrade the User Profile page to have a clean, premium dashboard layout with metric cards and clear typography.'
  }
];

async function runLoop() {
  console.log('Starting continuous design refinement loop for core pages...\n');
  
  for (const screen of SCREENS_TO_REFINE) {
    console.log(`=========================================`);
    console.log(`Refining screen: ${screen.name} (ID: ${screen.id})`);
    console.log(`Prompt: "${screen.prompt}"`);
    console.log(`=========================================`);
    
    try {
      // Run the edit command
      const cmd = `node "${REFINE_SCRIPT}" edit "${screen.id}" "${screen.prompt.replace(/"/g, '\\"')}"`;
      console.log(`Running: ${cmd}`);
      const output = execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
      console.log(`Completed refinement for ${screen.name}!\n`);
    } catch (err) {
      console.error(`Failed to refine screen ${screen.name}:`, err.message);
    }
  }
  
  console.log('All screen refinements in the loop have finished execution!');
}

runLoop();
