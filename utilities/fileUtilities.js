import fs from 'node:fs/promises';
export async function deleteTempFiles(tempFilePaths) {
    let success = true;
    for (const tempFilePath of tempFilePaths) {
        try {
            await fs.unlink(tempFilePath);
        }
        catch (error) {
            console.log(error);
            success = false;
        }
    }
    return success;
}
