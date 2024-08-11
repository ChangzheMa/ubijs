import { promises as fs } from 'fs'
import * as path from 'path'
import * as log4js from 'log4js';

export const logger = log4js.getLogger();
logger.level = 'debug';

export const sleep = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export const appendToFile = async (filePath: string, strData: string) => {
    try {
        filePath = filePath.replace(/:/g, '-')
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.appendFile(filePath, strData + '\n', 'utf8');
    } catch (error) {
        logger.error(`Error appending to file: ${error}`);
    }
}