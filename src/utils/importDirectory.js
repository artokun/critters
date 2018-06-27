function getFilenames(directory) {
  return directory.keys().map(key => key.match(/([^/]+)(?=\.\w+$)/)[0]);
}

function mapImportsToFilenames(imports, filenames) {
  return imports.reduce((files, provider, index) => {
    const fileList = files;
    fileList[filenames[index]] = provider.default;
    return fileList;
  }, {});
}

export default function importDirectory(directory) {
  const imports = directory.keys().map(directory);
  const filenames = getFilenames(directory);

  return mapImportsToFilenames(imports, filenames);
}
