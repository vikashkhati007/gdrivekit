import { driveService } from './driveService';

async function main(): Promise<void> {
  try {
    // Example: List files
    console.log('📂 Listing files...');
    const filesResult = await driveService.listFiles({ pageSize: 5 });
    if (filesResult.success && filesResult.data) {
      console.log('Files:', filesResult.data.files);
    } else {
      console.error('Error:', filesResult.error);
    }

    // Example: Create folder
    // console.log('\n📁 Creating folder...');
    // const folderResult = await driveService.createFolder('Test Folder TypeScript');
    // if (folderResult.success && folderResult.data) {
    //   console.log('Folder created:', folderResult.data);
    // } else {
    //   console.error('Error:', folderResult.error);
    // }

    // // Example: Search files
    // console.log('\n🔍 Searching for folders...');
    // const searchResult = await driveService.searchFiles(
    //   "mimeType='application/vnd.google-apps.folder'",
    //   5
    // );
    // if (searchResult.success && searchResult.data) {
    //   console.log('Found folders:', searchResult.data.files);
    // }

    // More examples (uncomment to use):
    
    // Upload file
    // const uploadResult = await driveService.uploadFile('./test.txt', { 
    //   name: 'uploaded-test.txt' 
    // });
    // console.log(uploadResult);

    // Get file metadata
    // const metadataResult = await driveService.getFileMetadata('FILE_ID');
    // console.log(metadataResult);

    // Download file
    // const downloadResult = await driveService.downloadFile('FILE_ID', './downloaded-file.txt');
    // console.log(downloadResult);

    // Update file metadata
    // const updateMetaResult = await driveService.updateFileMetadata('FILE_ID', { 
    //   name: 'New Name' 
    // });
    // console.log(updateMetaResult);

    // Update file content
    // const updateContentResult = await driveService.updateFileContent('FILE_ID', './new-content.txt');
    // console.log(updateContentResult);

    // Delete file
    // const deleteResult = await driveService.deleteFile('FILE_ID');
    // console.log(deleteResult);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error: Error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}