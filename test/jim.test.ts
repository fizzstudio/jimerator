import { expect, test } from 'vitest';
import fs from 'node:fs';
import { Jimerator } from '../lib';
import { Manifest } from '@fizz/paramanifest';

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

function testInstanceJim(jsonFilepath: string): void {
  const rawInstance = fs.readFileSync(jsonFilepath, 'utf8');
  const instance = JSON.parse(rawInstance) as Manifest;
  try {
    const jimerator = new Jimerator(instance);
    jimerator.render();
    console.log(instance.datasets[0].title, '\n', jimerator.jim)
    test(jsonFilepath, () => {
      expect(jimerator.jim).toBeTruthy();
    })
  } catch {
    console.log('err', instance.datasets[0].title);
  }
}

/*for (const filename of MANIFEST_TEST_FILE_PATHS) {
  testInstanceJim(filename);
}*/

testInstanceJim(TEST_MANIFEST_DIR + '/pie-manifest-dark-matter.json')
