import util from 'util';
import fs from 'fs';
import Papa from 'papaparse';

const readFileAsync = util.promisify(fs.readFile);

const filePath = '/Users/watcharaphat/project/homedot-clean-data/data/item_feature.csv';

async function getData() {
  let dataText;
  let data;

  try {
    dataText = await readFileAsync(filePath, 'utf8');

    data = await Papa.parse(dataText, {
      header: true,
      dynamicTyping: true,
    }).data;
  } catch (err) {
    throw err;
  }

  return data;
}

getData().then((data) => {
  console.log(data[0]);
});
