// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getProductById, updateProduct, addProductImage, deleteProductImages } from '@/app/admin/api/ProductsApi';
// import ProductForm from '../components/ProductForm';
// import LoadingSpinner from '@/components/LoadingSpinner';
// import { PhotoIcon, TrashIcon, ArrowUpTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// const EditProduct = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [uploadingImg, setUploadingImg] = useState(false);

//   // 1. فچ کردن محصول
//   useEffect(() => {
//     if (!id) return; // اگر آیدی نبود اجرا نشه
//     fetchProduct();
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       const data = await getProductById(id);
//       setProduct(data);
//     } catch (error) {
//       console.error("Error fetching product", error);
//       // اگر محصول پیدا نشد برگرده به لیست
//       navigate('/admin/products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. هندلر آپدیت
//   const handleUpdate = async (formData) => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         ...formData,
//         category: formData.category ? parseInt(formData.category) : null,
//         price: formData.price.toString(),
//         stock_quantity: parseInt(formData.stock_quantity),
//         package_quantity: parseInt(formData.package_quantity),
//       };
      
//       await updateProduct(id, payload);
//       alert("تغییرات ذخیره شد.");
//       fetchProduct(); 
//     } catch (error) {
//       console.error("Update failed", error);
//       alert("خطا در ویرایش محصول");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // 3. هندلر تصویر
//   const handleImageUpload = async (e) => {
//     e.preventDefault();
//     if (!selectedImage) return;

//     setUploadingImg(true);
//     try {
//       const formData = new FormData();
//       formData.append("image", selectedImage);
//       formData.append("is_main", "true"); 

//       await addProductImage(id, formData);
//       setSelectedImage(null);
//       fetchProduct(); 
//     } catch (error) {
//       alert("خطا در آپلود تصویر");
//     } finally {
//       setUploadingImg(false);
//     }
//   };

//   const handleDeleteImages = async () => {
//     if (!confirm("آیا تمام تصاویر حذف شوند؟")) return;
//     try {
//       await deleteProductImages(id);
//       fetchProduct();
//     } catch (error) {
//       alert("خطا در حذف تصاویر");
//     }
//   };

//   // *** بخش حیاتی برای جلوگیری از کرش ***
//   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
//   if (!product) return null; // اگر هنوز نال هست چیزی رندر نکن تا ریدایرکت انجام شه

//   return (
//     <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
//             {product.name ? product.name.charAt(0) : 'P'}
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-primary">ویرایش محصول</h1>
//             <p className="text-gray-500 text-sm font-mono mt-1">{product.part_code}</p>
//           </div>
//         </div>
//         <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
//            <ArrowLeftIcon className="w-5 h-5" /> بازگشت
//         </button>
//       </div>

//       <div className="space-y-8">
//         {/* Image Management */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
//           <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
//             <PhotoIcon className="w-5 h-5" /> تصاویر محصول
//           </h3>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             {product.images && product.images.length > 0 ? (
//               product.images.map((img, idx) => (
//                 <div key={img.id || idx} className="relative w-32 h-32 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//                   <img src={img.image_url} alt="Product" className="w-full h-full object-cover" />
//                 </div>
//               ))
//             ) : (
//               <div className="w-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
//                 هنوز تصویری آپلود نشده است.
//               </div>
//             )}
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-gray-100 pt-4">
//             <form onSubmit={handleImageUpload} className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
//               <input 
//                 type="file" 
//                 accept="image/*"
//                 onChange={(e) => setSelectedImage(e.target.files[0])}
//                 className="block w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
//               />
//               <button 
//                 type="submit" 
//                 disabled={!selectedImage || uploadingImg}
//                 className="px-4 py-2 bg-primary text-accent rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-1 shadow-sm hover:shadow-md transition-all"
//               >
//                 {uploadingImg ? "..." : <><ArrowUpTrayIcon className="w-4 h-4"/> آپلود</>}
//               </button>
//             </form>

//             {product.images && product.images.length > 0 && (
//               <button 
//                 onClick={handleDeleteImages}
//                 className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
//               >
//                 <TrashIcon className="w-4 h-4" /> حذف همه
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Main Form */}
//         <ProductForm 
//           initialData={product} 
//           onSubmit={handleUpdate} 
//           isSubmitting={isSubmitting} 
//           isEditMode={true} 
//         />
//       </div>
//     </div>
//   );
// };

// export default EditProduct;