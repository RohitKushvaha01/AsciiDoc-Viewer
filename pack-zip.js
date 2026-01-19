const path = require('path');
const fs = require('fs');
const jszip = require('jszip');

const iconFile = path.join(__dirname, 'icon.png');
const pluginJSON = path.join(__dirname, 'plugin.json');
const distFolder = path.join(__dirname, 'dist');
const assetsFolder = path.join(__dirname, 'assets');

const zip = new jszip();

// 1. Add Root Files
if (fs.existsSync(iconFile)) zip.file('icon.png', fs.readFileSync(iconFile));
if (fs.existsSync(pluginJSON)) zip.file('plugin.json', fs.readFileSync(pluginJSON));

// 2. Handle Readme and Changelog
const readmePath = [path.join(__dirname, 'readme.md'), path.join(__dirname, 'README.md')].find(fs.existsSync);
if (readmePath) zip.file('readme.md', fs.readFileSync(readmePath));

const changelogPath = [path.join(__dirname, 'changelog.md'), path.join(__dirname, 'CHANGELOG.md')].find(fs.existsSync);
if (changelogPath) zip.file('changelog.md', fs.readFileSync(changelogPath));

// 3. Add Folders
// We pass '' for dist so its contents are at the zip root, 
// and 'assets' so they stay inside an assets folder.
if (fs.existsSync(distFolder)) addFolderToZip(distFolder, '');
if (fs.existsSync(assetsFolder)) addFolderToZip(assetsFolder, 'assets');

// 4. Generate Zip
zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream(path.join(__dirname, 'plugin.zip')))
  .on('finish', () => {
    console.log('Plugin plugin.zip written successfully.');
  });

/**
 * Recursively adds files from a physical directory into the JSZip instance
 * @param {string} localPath - The actual path on your computer
 * @param {string} zipPath - The path it should have inside the zip
 */
function addFolderToZip(localPath, zipPath) {
  const files = fs.readdirSync(localPath);

  files.forEach((file) => {
    const filePath = path.join(localPath, file);
    const stat = fs.statSync(filePath);
    // Maintain relative path within the zip
    const itemZipPath = zipPath ? path.join(zipPath, file) : file;

    if (stat.isDirectory()) {
      addFolderToZip(filePath, itemZipPath);
    } else {
      // Filter out unwanted files
      if (!/LICENSE.txt/.test(file) && !file.startsWith('.')) {
        zip.file(itemZipPath, fs.readFileSync(filePath));
      }
    }
  });
}