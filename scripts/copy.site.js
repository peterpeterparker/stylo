#!/usr/bin/env node

const {join} = require('path');
const {readdirSync, lstatSync, copyFileSync} = require('fs');

const copySite = async ({src, dest}) => {
  const promises = readdirSync(src).map(
    (dirent) =>
      new Promise(async (resolve) => {
        const [srcPath, destPath] = [src, dest].map((dirPath) => join(dirPath, dirent));

        const stat = lstatSync(srcPath);

        if (stat.isDirectory()) {
          await copySite({src: srcPath, dest: destPath});
        } else if (stat.isFile()) {
          await copyFile({srcPath, destPath});
        }

        resolve();
      })
  );

  await Promise.all(promises);
};

const copyFile = async ({srcPath, destPath}) => copyFileSync(srcPath, destPath);

(async () => {
  try {
    await copySite({src: `${process.cwd()}/site`, dest: `${process.cwd()}/www`});

    console.log(`Site static data copied to www.`);
  } catch (err) {
    console.error(`Error while copying static data for website.`, err);
  }
})();
