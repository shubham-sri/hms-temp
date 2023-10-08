import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse,  } from 'next';

const logDirectory = process.env.LOG_DIR ?? path.join('.','logs');
const secretKey  = process.env.LOG_SECRET ?? 'sdkxjfkdj';

const logRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    const startTimestamp = Date.now();
    const { method, body, query, url, headers } = req;
    const isInternet = url?.includes('internet');
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    const logFilePath = path.join(logDirectory, `api_${isInternet ? 'internet' : 'success' }_${day}_${month}_${year}.log`);
    const logFileExist = fs.existsSync(logFilePath);
  
    let log = {};
    if(isInternet) {
      log = {
        userNumber: headers['x-user-number'],
        userId: headers['x-user-id'],
        online: query.online,
        timestamp: date,
      }
    } else {
      log = {
        method,
        body,
        query,
        url,
        userId: headers['x-user-id'],
        timestamp: date,
      }
    }
  
    try {
      let encryptedData;
      if(!isInternet) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
        let encrypted = cipher.update(JSON.stringify(log), 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        encryptedData = `${iv.toString('hex')}:--:${encrypted}\n`;
      } else {
        encryptedData = `${JSON.stringify(log)}\n`;
      }
      if (!logFileExist) {
        fs.writeFileSync(logFilePath, encryptedData);
        return;
      }
      fs.appendFileSync(logFilePath, encryptedData);
    } catch (error) {
      console.log('error', error);
      const errorFilePath = path.join(logDirectory, `api_error_${day}_${month}_${year}.log`);
      const errorFileExist = fs.existsSync(errorFilePath);
      if(!errorFileExist) {
        fs.writeFileSync(errorFilePath, JSON.stringify({...log, error, body: undefined}));
        return;
      }
      fs.appendFileSync(errorFilePath, JSON.stringify({...log, error, body: undefined}));
    } finally {
      const endTimestamp = Date.now();
      console.log(`log time for ${url} ${endTimestamp - startTimestamp}ms`, );
    }
};

export default logRequest;