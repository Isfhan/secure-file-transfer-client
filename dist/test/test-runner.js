import { runListTest } from './list.test.js';
import { runUploadTest } from './upload.test.js';
import { runDownloadTest } from './download.test.js';
import { runRenameTest } from './rename.test.js';
import { runDeleteTest } from './delete.test.js';
(async () => {
    try {
        console.log('Starting List Test');
        await runListTest();
        console.log('Starting Upload Test');
        await runUploadTest();
        console.log('Starting Download Test');
        await runDownloadTest();
        console.log('Starting Rename Test');
        await runRenameTest();
        console.log('Starting Delete Test');
        await runDeleteTest();
        console.log('All tests completed successfully.');
    }
    catch (error) {
        console.error('Error in tests:', error);
        process.exit(1);
    }
})();
