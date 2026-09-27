/**
 * Helper to recursively extract all files from HTML5 DataTransfer
 * Supports loose files, dropped folders, nested directory hierarchies, and images.
 */
export async function extractFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const extractedFiles: File[] = [];

  // 1. Try webkitGetAsEntry (Chromium / Electron FileSystem API)
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    const entries: any[] = [];
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          entries.push(entry);
        } else {
          const file = item.getAsFile();
          if (file) extractedFiles.push(file);
        }
      }
    }

    if (entries.length > 0) {
      async function traverseEntry(entry: any): Promise<void> {
        if (!entry) return;

        if (entry.isFile) {
          return new Promise<void>((resolve) => {
            entry.file(
              (file: File) => {
                if (file) {
                  extractedFiles.push(file);
                }
                resolve();
              },
              (err: any) => {
                console.warn('Could not read file entry:', entry.name, err);
                resolve();
              }
            );
          });
        } else if (entry.isDirectory) {
          return new Promise<void>((resolve) => {
            const dirReader = entry.createReader();
            const readNext = () => {
              dirReader.readEntries(
                async (subEntries: any[]) => {
                  if (!subEntries || subEntries.length === 0) {
                    resolve();
                  } else {
                    for (const sub of subEntries) {
                      await traverseEntry(sub);
                    }
                    // Chromium requires readEntries to be called repeatedly until empty
                    readNext();
                  }
                },
                (err: any) => {
                  console.warn('Could not read directory entries:', entry.name, err);
                  resolve();
                }
              );
            };
            readNext();
          });
        }
      }

      for (const entry of entries) {
        await traverseEntry(entry);
      }

      if (extractedFiles.length > 0) {
        return filterSupportedFiles(extractedFiles);
      }
    }
  }

  // 2. Fallback to dataTransfer.files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      // Exclude directories (size 0 and no extension)
      if (file && (file.size > 0 || file.name.includes('.'))) {
        extractedFiles.push(file);
      }
    }
  }

  return filterSupportedFiles(extractedFiles);
}

/**
 * Filter out system junk (.DS_Store, Thumbs.db, desktop.ini)
 */
function filterSupportedFiles(files: File[]): File[] {
  const ignorePatterns = [
    /\.ds_store$/i,
    /thumbs\.db$/i,
    /desktop\.ini$/i,
    /~.*\.tmp$/i
  ];

  return files.filter(f => !ignorePatterns.some(pattern => pattern.test(f.name)));
}

/**
 * Check file classification
 */
export function getFileCategory(file: File): 'pdf' | 'image' | 'text' | 'unsupported' {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const type = file.type.toLowerCase();

  if (type === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }

  if (
    type.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif', 'gif', 'svg'].includes(ext)
  ) {
    return 'image';
  }

  if (
    type.startsWith('text/') ||
    ['txt', 'md', 'text', 'rtf', 'log', 'csv', 'json', 'xml', 'html', 'htm'].includes(ext)
  ) {
    return 'text';
  }

  return 'unsupported';
}
