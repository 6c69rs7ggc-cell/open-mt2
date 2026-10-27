#!/usr/bin/env node
'use strict';

// Compare an authorized/exported Mobile2 TSV proto table with ASHEN REALM's
// current JSON table. This does not read or decrypt PAK files.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONFIGS = {
  items: {
    sourceName: 'item_proto.txt',
    serverPath: path.join(ROOT, 'src/core/infra/config/data/items.json'),
    idCandidates: ['vnum', 'id', 'item_id', 'itemid', 'item_vnum'],
  },
  mobs: {
    sourceName: 'mob_proto.txt',
    serverPath: path.join(ROOT, 'src/core/infra/config/data/mobs.json'),
    idCandidates: ['vnum', 'id', 'mob_id', 'mobid', 'race', 'race_num'],
  },
};

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[\s_-]/g, '');
}

function getRecords(value) {
  if (Array.isArray(value)) return value.filter((row) => row && typeof row === 'object');
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, row]) => {
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        return { __mapKey: key, ...row };
      }
      return { __mapKey: key, value: row };
    });
  }
  throw new Error('Server JSON must contain an array or object of records.');
}

function findIdField(records, candidates, sourceLabel) {
  const first = records.find((row) => row && typeof row === 'object');
  if (!first) throw new Error(sourceLabel + ' contains no data rows.');
  const fields = new Map(Object.keys(first).map((key) => [normalizeKey(key), key]));
  for (const candidate of candidates) {
    const found = fields.get(normalizeKey(candidate));
    if (found) return found;
  }
  if (fields.has('id')) return fields.get('id');
  if (fields.has('__mapkey')) return fields.get('__mapKey');
  throw new Error(
    'Could not identify the ID column in ' + sourceLabel +
    '. Available fields: ' + Object.keys(first).join(', ')
  );
}

function readTsv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
  if (!text) throw new Error('Source table is empty: ' + filePath);
  const lines = text.split(/\r?\n/);
  const headers = lines.shift().split('\t').map((field) => field.trim());
  if (headers.length < 2) {
    throw new Error('Expected a tab-separated table with a header row: ' + filePath);
  }
  const records = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    if (!lines[lineIndex].trim()) continue;
    const values = lines[lineIndex].split('\t');
    const record = {};
    headers.forEach((header, index) => { record[header] = values[index] ?? ''; });
    records.push(record);
  }
  return { headers, records };
}

function toId(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return text;
}

function indexRecords(records, idField, label) {
  const byId = new Map();
  const duplicateIds = [];
  let missingIdCount = 0;
  for (const row of records) {
    const id = toId(row[idField]);
    if (id === null) {
      missingIdCount += 1;
      continue;
    }
    if (byId.has(id)) duplicateIds.push(id);
    else byId.set(id, row);
  }
  return { byId, duplicateIds, missingIdCount, label };
}

function main() {
  const args = process.argv.slice(2);
  const kindIndex = args.indexOf('--kind');
  const sourceIndex = args.indexOf('--source');
  const kind = kindIndex >= 0 ? args[kindIndex + 1] : '';
  const sourcePath = sourceIndex >= 0 ? args[sourceIndex + 1] : '';
  if (!CONFIGS[kind] || !sourcePath) {
    console.error(
      'Usage: node tools/compareMobile2Proto.js --kind items|mobs --source /path/to/exported_proto.txt\n' +
      'The source must be a legally obtained/exported TSV with a header row.'
    );
    process.exitCode = 2;
    return;
  }

  const config = CONFIGS[kind];
  const source = readTsv(path.resolve(sourcePath));
  const serverJson = JSON.parse(fs.readFileSync(config.serverPath, 'utf8'));
  const serverRecords = getRecords(serverJson);
  const sourceIdField = findIdField(source.records, config.idCandidates, 'exported source table');
  const serverIdField = findIdField(serverRecords, config.idCandidates, 'server JSON');
  const sourceIndexData = indexRecords(source.records, sourceIdField, 'exported source');
  const serverIndexData = indexRecords(serverRecords, serverIdField, 'server JSON');

  const sourceIds = [...sourceIndexData.byId.keys()];
  const serverIds = [...serverIndexData.byId.keys()];
  const serverIdSet = new Set(serverIds);
  const sourceIdSet = new Set(sourceIds);
  const sourceOnly = sourceIds.filter((id) => !serverIdSet.has(id));
  const serverOnly = serverIds.filter((id) => !sourceIdSet.has(id));
  const shared = sourceIds.filter((id) => serverIdSet.has(id));

  const report = {
    kind,
    sourceFile: path.resolve(sourcePath),
    serverFile: path.relative(ROOT, config.serverPath),
    sourceRows: source.records.length,
    serverRows: serverRecords.length,
    sourceIdField,
    serverIdField,
    sharedIdCount: shared.length,
    sourceOnlyIdCount: sourceOnly.length,
    serverOnlyIdCount: serverOnly.length,
    sourceDuplicateIds: [...new Set(sourceIndexData.duplicateIds)],
    serverDuplicateIds: [...new Set(serverIndexData.duplicateIds)],
    sourceRowsMissingId: sourceIndexData.missingIdCount,
    serverRowsMissingId: serverIndexData.missingIdCount,
    sampleSourceOnlyIds: sourceOnly.slice(0, 50),
    sampleServerOnlyIds: serverOnly.slice(0, 50),
    note: 'ID overlap only; this does not establish field/schema compatibility or permission to reuse assets.',
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  console.error('Mobile2 proto comparison failed: ' + error.message);
  process.exitCode = 1;
}
