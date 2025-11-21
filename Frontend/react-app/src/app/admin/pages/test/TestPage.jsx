// src/app/admin/pages/test/TestPage.jsx
import React, { useState } from 'react';
import { getCars, createCar, deleteCar } from '../../api/CarsApi';

const TestPage = () => {
  const [output, setOutput] = useState('');

  const runTest = async (testName) => {
    setOutput(`در حال اجرای تست: ${testName}...`);
    try {
      let result;
      switch (testName) {
        case 'getCars':
          result = await getCars();
          break;
        case 'createCar':
          // یک ماشین تستی می‌سازیم
          result = await createCar({ make: 'تست', model: 'تستی', year: 1402 });
          break;
        case 'deleteCar':
          // برای حذف، باید یک آی‌دی معتبر بدی. اینجا مثلاً آی‌دی ۱ رو حذف می‌کنیم
          // اگه ماشین با آی‌دی ۱ وجود نداشته باشه، خطا میده که طبیعیه
          result = await deleteCar(1); 
          break;
        default:
          result = 'تست نامشخص';
      }
      setOutput(`موفقیت‌آمیز! نتیجه:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setOutput(`خطا!:\n${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow min-w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">تست API ها</h2>
      <div className="gap-4  flex flex-wrap">
        <button onClick={() => runTest('getCars')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          تست گرفتن ماشین‌ها
        </button>
        <button onClick={() => runTest('createCar')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          تست ساخت ماشین جدید
        </button>
        <button onClick={() => runTest('deleteCar')} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          تست حذف ماشین (id=1)
        </button>
      </div>
      <pre className="mt-4 p-4 bg-gray-800 text-green-400 rounded whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
};

export default TestPage;