// // src/app/admin/pages/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { 
//   getCars, 
//   getCarById,
//   createCar, 
//   updateCar, 
//   deleteCar, 
//   bulkDeleteCars 
// } from "../../api/CarsApi";

// const Dashboard = () => {
//   // ==================== State ها ====================
//   const [cars, setCars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   // فرم دیتا برای ادیت و ساخت ماشین جدید
//   const [formData, setFormData] = useState({ make: '', model: '', year: '' });
//   const [editingCar, setEditingCar] = useState(null);

//   const [selectedCars, setSelectedCars] = useState(new Set());

//   // ==================== useEffect برای بارگذاری اولیه ====================
//   useEffect(() => {
//     const fetchCars = async () => {
//       try {
//         setLoading(true);
//         const carsData = await getCars();
//         setCars(carsData);
//       } catch (err) {
//         setError("خطا در بارگذاری ماشین‌ها.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCars();
//   }, []);
 
//   // ==================== توابع مدیریت رویدادها ====================
  
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       if (editingCar) {
//         await updateCar(editingCar.id, formData);
//         alert("ماشین با موفقیت ویرایش شد!");
//       } else {
//         await createCar(formData);
//         alert("ماشین جدید با موفقیت ساخته شد!");
//       }
//       const carsData = await getCars();
//       setCars(carsData);
//       setFormData({ make: '', model: '', year: '' }); // فرم رو با مقادیر خالی کن
//       setEditingCar(null);
//     } catch (err) {
//       setError("عملیات ناموفق بود. لطفاً فیلدها را بررسی کنید.");
//     }
//   };

//   const handleEdit = (car) => {
//     setEditingCar(car);
//     setFormData({ make: car.make, model: car.model, year: car.year });
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("آیا از حذف این ماشین مطمئن هستید؟")) {
//       try {
//         await deleteCar(id);
//         alert("ماشین حذف شد.");
//         setCars(prevCars => prevCars.filter(car => car.id !== id));
//       } catch (err) {
//         setError("خطا در حذف ماشین.");
//       }
//     }
//   };

//   const handleSelectCar = (id) => {
//     const newSelected = new Set(selectedCars);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedCars(newSelected);
//   };

//   const handleBulkDelete = async () => {
//     if (selectedCars.size === 0) {
//       alert("هیچ ماشینی انتخاب نشده است.");
//       return;
//     }
//     if (window.confirm(`آیا از حذف ${selectedCars.size} ماشین مطمئن هستید؟`)) {
//       try {
//         await bulkDeleteCars(Array.from(selectedCars));
//         alert("ماشین‌های انتخابی حذف شدند.");
//         const carsData = await getCars();
//         setCars(carsData);
//         setSelectedCars(new Set());
//       } catch (err) {
//         setError("خطا در حذف گروهی ماشین‌ها.");
//       }
//     }
//   };

//   // ==================== رندر کردن کامپوننت ====================
//   if (loading) return <div>در حال بارگذاری...</div>;

//   return (
//     <div className="container mx-auto p-4">
//       {console.log(getCarById(1).model)}
//       <p>{getCarById(1).model}</p>
//       <h1 className="text-2xl font-bold mb-4">مدیریت ماشین‌ها</h1>
//       {error && <div className="bg-red-500 text-white p-2 mb-4">{error}</div>}

//       {/* فرم ساخت/ویرایش با فیلدهای درست */}
//       <form onSubmit={handleSubmit} className=" p-4 mb-6 rounded shadow bg-slate-900">
//         <h2>{editingCar ? 'ویرایش ماشین' : 'ساخت ماشین جدید'}</h2>
//         <input
//           type="text"
//           name="make"
//           placeholder="شرکت سازنده (مثلاً Hyundai)"
//           value={formData.make}
//           onChange={handleInputChange}
//           className="block w-full p-2 mb-2 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//         />
//         <input
//           type="text"
//           name="model"
//           placeholder="مدل ماشین (مثلاً Elantra)"
//           value={formData.model}
//           onChange={handleInputChange}
//           className="block w-full p-2 mb-2 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//         />
//         <input
//           type="number"
//           name="year"
//           placeholder="سال ساخت (مثلاً 1390)"
//           value={formData.year}
//           onChange={handleInputChange}
//           className="block w-full p-2 mb-2 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//         />
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           {editingCar ? 'ویرایش' : 'ساخت'}
//         </button>
//         {editingCar && (
//           <button type="button" onClick={() => setEditingCar(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">
//             انصراف
//           </button>
//         )}
//       </form>

//       <button onClick={handleBulkDelete} className="bg-red-600 text-white p-2 mb-4 rounded">
//         حذف گروهی ({selectedCars.size} انتخاب شده)
//       </button>

//       {/* لیست ماشین‌ها با استفاده صحیح از map */}
//       <ul className="space-y-2">
//         {cars.map((car) => {
//           // لاگ کردن به روش صحیح
//           console.log(car);
          
//           return (
//             <li key={car.id} className="bg-slate-900 p-4 border flex justify-between items-center rounded-lg shadow hover:shadow-lg">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedCars.has(car.id)}
//                   onChange={() => handleSelectCar(car.id)}
//                   className="ml-4 mr-2 h-5 w-5 text-blue-500 focus:ring-2 focus:ring-blue-500 rounded-md ring-offset-0 "
//                 />
//                 <Link to={`/cars/${car.id}`} className="text-blue-600 hover:underline">
//                   {car.make} - {car.model} - {car.year}
//                 </Link>
//               </div>
//               <div className="flex gap-4">
//                 <button onClick={() => handleEdit(car)} className="bg-yellow-500 text-white p-1 rounded ml-2">
//                   ویرایش
//                 </button>
//                 <button onClick={() => handleDelete(car.id)} className="bg-red-500 text-white p-1 rounded">
//                   حذف
//                 </button>
//               </div>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default Dashboard;


// src/app/admin/pages/dashboard/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-gray-700">داشبورد</h1>
    </div>
  );
};

export default Dashboard;