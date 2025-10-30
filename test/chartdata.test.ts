import { expect, test } from 'vitest';
import fs from 'node:fs';

import { ManifestValidator } from '../lib/index';

const manifestValidator = new ManifestValidator();

const TEST_MANIFEST_DIR = './node_modules/@fizz/chart-data/data/manifests';

async function collectInstanceFilepaths(dirPath: string): Promise<string[]> {
  const filepaths: string[] = [];
  const dir = fs.opendirSync(dirPath);
  for await (const direntry of dir) {
    if (direntry.isFile()) {
      filepaths.push(dirPath + '/' + direntry.name)
    } else {
      filepaths.push(...await collectInstanceFilepaths(dirPath + '/' + direntry.name));
    }
  }
  return filepaths;
}

const MANIFEST_TEST_FILE_PATHS = await collectInstanceFilepaths(TEST_MANIFEST_DIR);

async function testInstanceValidity(jsonFilepath: string, validator: ManifestValidator): Promise<void> {
  const rawInstance = fs.readFileSync(jsonFilepath, 'utf8');
  const instance = JSON.parse(rawInstance);
  const validatorOutput = await validator.validate(instance);
  if (!validatorOutput.valid) {
    console.log(`
      Test file: ${jsonFilepath}
      ${validatorOutput.errors}
    `);
  }
  test(jsonFilepath, () => {
    expect(validatorOutput.valid).toBeTruthy();
  })
}

for (const filename of MANIFEST_TEST_FILE_PATHS) {
  await testInstanceValidity(filename, manifestValidator);
}
