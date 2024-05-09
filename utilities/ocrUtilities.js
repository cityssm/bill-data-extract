import { extractData } from '../index.js';
export async function extractFullPageText(billPath, pageNumber = 1) {
    const rawData = await extractData([billPath], {
        text: {
            pageNumber
        }
    });
    return rawData.text;
}
