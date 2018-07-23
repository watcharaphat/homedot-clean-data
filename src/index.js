import util from 'util';
import fs from 'fs';
import Papa from 'papaparse';
import PercentileCalculator from 'percentile-calculator';
// import median from 'median-quickselect';

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

getData().then((datas) => {
  const fields = [
    'landSize',
    'starting_price',
    'amount_bedroom',
    'amount_bathroom',
    'amount_car_parking',
    'unit_functional_space_starting_size',
  ];

  const dataList = {};
  fields.forEach((field) => {
    dataList[field] = [];
  });

  datas.forEach((data) => {
    fields.forEach((field) => {
      if (data[field]) dataList[field].push(data[field]);
    });
  });

  let datasRemoveOutlier = datas.slice();

  for (const key in dataList) {
    const cal = new PercentileCalculator(dataList[key]);
    const q1 = cal.calculateQ1();
    const q3 = cal.calculateQ3();
    const iqr = q3 - q1;

    const oMin = q1 - (1.5 * iqr);
    const oMax = q3 + (1.5 * iqr)

    if (key !== 'amount_car_parking') {
      datasRemoveOutlier = datasRemoveOutlier.filter(d => d[key] >= oMin && d[key] <= oMax);
    }
    // console.log(`${key}, Q1: ${q1}\tQ3: ${q3}, IQR: ${iqr}, oMin: ${oMin}, oMax: ${oMax}`);
  }

  const cleanedData = datasRemoveOutlier.slice();
  const dataListR = {};
  fields.forEach((field) => {
    dataListR[field] = [];
  });

  cleanedData.forEach((data) => {
    fields.forEach((field) => {
      if (data[field]) dataListR[field].push(data[field]);
    });
  });

  // calculate median
  const median = {};
  for (const key in dataListR) {
    const cal = new PercentileCalculator(dataListR[key]);

    median[key] = cal.calculateQ2();
    console.log(`${key}: ${median[key]}`);
  }

  cleanedData.forEach((data) => {
    // for (const key in data) {
    //   if (!data[key]) {
    //     data[key] = median[key];
    //   }
    // }
    fields.forEach((key) => {
      if (!data[key]) {
        data[key] = median[key];
      }
    });
  });

  console.log(cleanedData[0]);

  const dataCSV = Papa.unparse(cleanedData);
  console.log('Writing csv.');
  fs.writeFileSync(
    '/Users/watcharaphat/project/homedot-clean-data/data/cleaned_item_feature.csv',
    dataCSV,
    'utf8',
  )
  console.log('Done');
});
