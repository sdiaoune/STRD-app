#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

type Finding = { file: string; line: number; match: string; snippet: string };

const TARGET_DIRECTORIES = ['screens', 'components', 'src/design', 'app'];
const FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ALLOWLIST_REGEX = [
  /__tests__\//,
  /ComponentGallery/,
  /ui\.snap\.test/,
];

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const FUNCTION_PATTERN = /\b(?:rgba?|hsla?)\s*\(/g;
const NAMED_PATTERN = /\b(?:white|black|red|blue|green|yellow|cyan|magenta|purple|orange|gray|grey)\b/gi;

async function main() {
  const root = path.resolve(__dirname, '..');
  const files = (
    await Promise.all(
      TARGET_DIRECTORIES.map((dir) => collectFiles(path.join(root, dir)))
    )
  ).flat();

  const findings: Finding[] = [];
  for (const file of files) {
    if (ALLOWLIST_REGEX.some((regex) => regex.test(file))) continue;
    const content = await fs.readFile(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (line.includes('color-literal-ok')) return;
      const matches = [
        ...(line.match(HEX_PATTERN) ?? []),
        ...(line.match(FUNCTION_PATTERN) ?? []),
        ...(line.match(NAMED_PATTERN) ?? []),
      ];
      const filtered = matches.filter((token) => !isFalsePositive(token));
      if (filtered.length) {
        filtered.forEach((token) =>
          findings.push({
            file,
            line: idx + 1,
            match: token,
            snippet: line.trim(),
          })
        );
      }
    });
  }

  if (findings.length) {
    console.error('\nHard-coded colors detected:\n');
    findings.forEach((f) => {
      console.error(
        `- ${path.relative(root, f.file)}:${f.line} => ${f.match} | ${f.snippet}`
      );
    });
    console.error(
      '\nReplace literals with theme tokens (`theme.colors.*`, `Button` tone props, etc.) or add an explicit allowlist entry with justification.'
    );
    process.exit(1);
  }

  console.log('✅ No hard-coded colors found.');
}

function isFalsePositive(token: string) {
  // Allow CSS variables or references to tokens such as `#FFFFFF` inside documentation strings.
  if (/^#[0-9a-fA-F]{3,8}$/.test(token)) {
    return false;
  }
  // Basic named colors frequently appear in doc copy; require uppercase to avoid flagging constants
  if (/^[A-Z_]+$/.test(token)) {
    return true;
  }
  return false;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await safeReadDir(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (FILE_EXTENSIONS.has(ext)) files.push(fullPath);
    }
  }
  return files;
}

async function safeReadDir(dir: string) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (err: any) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

void main();

