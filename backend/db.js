import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');

const getFilePath = (filename) => path.join(DATA_DIR, filename);

const readJSON = (filename) => {
  try {
    const filePath = getFilePath(filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeJSON = (filename, data) => {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

export const db = {
  getVendors: () => readJSON('vendors.json'),
  saveVendors: (data) => writeJSON('vendors.json', data),
  
  getProducts: () => readJSON('products.json'),
  saveProducts: (data) => writeJSON('products.json', data),
  
  getBlogs: () => readJSON('blogs.json'),
  saveBlogs: (data) => writeJSON('blogs.json', data),
  
  getGuides: () => readJSON('guides.json'),
  
  getOrders: () => readJSON('orders.json'),
  saveOrders: (data) => writeJSON('orders.json', data),
  
  getReminders: () => readJSON('reminders.json'),
  saveReminders: (data) => writeJSON('reminders.json', data),
  
  getCategories: () => readJSON('categories.json'),
  saveCategories: (data) => writeJSON('categories.json', data),
  
  getItemTypes: () => readJSON('itemTypes.json'),
  saveItemTypes: (data) => writeJSON('itemTypes.json', data),
  
  getRiders: () => readJSON('riders.json'),
  saveRiders: (data) => writeJSON('riders.json', data),
  
  getWallet: () => {
    try {
      const data = fs.readFileSync(getFilePath('wallet.txt'), 'utf8');
      return parseFloat(data) || 1500;
    } catch {
      return 1500;
    }
  },
  saveWallet: (val) => {
    try {
      fs.writeFileSync(getFilePath('wallet.txt'), val.toString(), 'utf8');
      return true;
    } catch {
      return false;
    }
  }
};
