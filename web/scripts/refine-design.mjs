import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StitchToolClient } from '/Users/a/.npm/_npx/829c6278c197c365/node_modules/@google/stitch-sdk/dist/src/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GCLOUD_PATH = '/Users/a/.stitch-mcp/google-cloud-sdk/bin/gcloud';
const CLOUDSDK_CONFIG = '/Users/a/.stitch-mcp/config';
const PROJECT_ID = '11024261575852370002';
const OUTPUT_DIR = path.join(__dirname, '..', 'design-research');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getAccessToken() {
  console.log('Fetching Google Cloud access token...');
  return execSync(`CLOUDSDK_CONFIG=${CLOUDSDK_CONFIG} ${GCLOUD_PATH} auth application-default print-access-token`, { encoding: 'utf-8' }).trim();
}

async function listScreens(client) {
  console.log('Listing all screens in Stitch project...');
  const res = await client.callTool('list_screens', { projectId: PROJECT_ID });
  const screens = res.screens || [];
  console.log(`Found ${screens.length} screens:`);
  for (const s of screens) {
    const id = s.name.split('/').pop();
    console.log(`- [${id}] "${s.title}" (${s.deviceType || 'DESKTOP'})`);
  }
  return screens;
}

async function downloadAsset(url, dest) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (dest.endsWith('.png')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(dest, buffer);
    } else {
      const text = await response.text();
      fs.writeFileSync(dest, text);
    }
    console.log(`Saved: ${dest}`);
  } catch (err) {
    console.error(`Failed to download asset to ${dest}: ${err.message}`);
  }
}

async function getAndDownloadScreen(client, screenId) {
  console.log(`Retrieving screen details for ${screenId}...`);
  const screen = await client.callTool('get_screen', {
    projectId: PROJECT_ID,
    screenId,
    name: `projects/${PROJECT_ID}/screens/${screenId}`
  });

  const title = (screen.title || 'untitled').replace(/[^a-zA-Z0-9-_]/g, '_');
  
  if (screen.htmlCode && screen.htmlCode.downloadUrl) {
    const htmlDest = path.join(OUTPUT_DIR, `${screenId}_${title}.html`);
    await downloadAsset(screen.htmlCode.downloadUrl, htmlDest);
  }
  if (screen.screenshot && screen.screenshot.downloadUrl) {
    const imgDest = path.join(OUTPUT_DIR, `${screenId}_${title}.png`);
    await downloadAsset(screen.screenshot.downloadUrl, imgDest);
  }
}

async function editScreen(client, screenId, prompt) {
  console.log(`Sending edit prompt for screen ${screenId}...`);
  console.log(`Prompt: "${prompt}"`);
  
  const raw = await client.callTool('edit_screens', {
    projectId: PROJECT_ID,
    selectedScreenIds: [screenId],
    prompt,
    modelId: 'GEMINI_3_1_PRO'
  });

  const screen = raw?.outputComponents?.[0]?.design?.screens?.[0];
  if (!screen) {
    console.error('No screens returned in the response:', JSON.stringify(raw, null, 2));
    return;
  }

  const newId = screen.name.split('/').pop();
  console.log(`Successfully generated edited screen. New Screen ID: ${newId}`);

  const title = (screen.title || 'untitled').replace(/[^a-zA-Z0-9-_]/g, '_');
  if (screen.htmlCode && screen.htmlCode.downloadUrl) {
    const htmlDest = path.join(OUTPUT_DIR, `${newId}_${title}_edited.html`);
    await downloadAsset(screen.htmlCode.downloadUrl, htmlDest);
  }
  if (screen.screenshot && screen.screenshot.downloadUrl) {
    const imgDest = path.join(OUTPUT_DIR, `${newId}_${title}_edited.png`);
    await downloadAsset(screen.screenshot.downloadUrl, imgDest);
  }
  
  if (raw.outputComponents?.[0]?.text) {
    console.log('\n--- Stitch Comments & Explanations ---');
    console.log(raw.outputComponents[0].text);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !['list', 'download', 'edit'].includes(command)) {
    console.log('Usage:');
    console.log('  node refine-design.mjs list');
    console.log('  node refine-design.mjs download <screenId>');
    console.log('  node refine-design.mjs edit <screenId> "<prompt>"');
    process.exit(1);
  }

  const token = getAccessToken();
  const client = new StitchToolClient({
    accessToken: token,
    projectId: 'beaming-benefit-435011-r0',
  });

  await client.connect();

  try {
    if (command === 'list') {
      await listScreens(client);
    } else if (command === 'download') {
      const screenId = args[1];
      if (!screenId) {
        console.error('Error: screenId is required.');
        process.exit(1);
      }
      await getAndDownloadScreen(client, screenId);
    } else if (command === 'edit') {
      const screenId = args[1];
      const prompt = args[2];
      if (!screenId || !prompt) {
        console.error('Error: screenId and prompt are required.');
        process.exit(1);
      }
      await editScreen(client, screenId, prompt);
    }
  } catch (err) {
    console.error('Operation failed:', err);
  } finally {
    await client.close();
  }
}

main();
