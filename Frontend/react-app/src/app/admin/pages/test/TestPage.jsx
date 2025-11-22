import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getProducts, 
  deleteProduct, 
  bulkDeleteProducts, 
  bulkUpdateProductStatus 
} from "@/app/admin/api/ProductsApi";

// آیکون‌ها (استفاده از SVG استاندارد برای پرهیز از وابستگی اضافی)
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>,
};

const ProductList = () => {
  const navigate = useNavigate();

  // ================= State Management =================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ================= Fetching Data =================
  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2 || searchQuery.length === 0) {
        fetchProducts({ search: searchQuery });
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getProducts(params);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ================= Handlers =================
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        alert("خطا در عملیات حذف");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید ${selectedIds.length} محصول را حذف کنید؟`)) {
      try {
        await bulkDeleteProducts(selectedIds);
        setProducts(products.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } catch (error) {
        alert("خطا در حذف گروهی");
      }
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      await bulkUpdateProductStatus(selectedIds, status);
      fetchProducts(); 
      setSelectedIds([]);
    } catch (error) {
      alert("خطا در تغییر وضعیت");
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    return Number(price).toLocaleString() + " تومان";
  };

  // ================= Render =================
  return (
    <div className="w-full min-h-full animate-fade-in">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">محصولات</h1>
          <p className="text-gray-500 text-sm mt-1">مدیریت موجودی و لیست قطعات</p>
        </div>
        
        <button 
          onClick={() => navigate('new')}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-6 rounded-xl shadow-md shadow-accent/20 transition-all active:scale-95"
        >
          <Icons.Plus />
          <span>افزودن محصول</span>
        </button>
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <Icons.Search />
            </div>
            <input 
              type="text" 
              placeholder="جستجو در نام، کد قطعه، برند..." 
              className="w-full pl-4 pr-10 py-2.5 bg-surface border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm text-primary placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Actions Panel */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Bulk Actions Display */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-primary/5 p-1.5 rounded-lg border border-primary/10">
                <span className="text-xs font-bold text-primary px-2">
                  {selectedIds.length} انتخاب شده
                </span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button onClick={() => handleBulkStatus(true)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors">
                  فعال
                </button>
                <button onClick={() => handleBulkStatus(false)} className="text-xs bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors">
                  غیرفعال
                </button>
                <button onClick={handleBulkDelete} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1">
                  <Icons.Trash />
                </button>
              </div>
            )}

            <button className="p-2.5 bg-surface text-gray-600 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200" title="فیلترها">
              <Icons.Filter />
            </button>
          </div>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            {/* Table Header: Primary Color */}
            <thead className="bg-primary text-white text-xs uppercase font-medium">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-400 text-accent focus:ring-accent cursor-pointer bg-transparent"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4">تصویر</th>
                <th className="p-4">نام محصول / دسته</th>
                <th className="p-4">مشخصات فنی</th>
                <th className="p-4">قیمت / موجودی</th>
                <th className="p-4 text-center">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="p-4">
                      <div className="h-10 bg-surface rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                    <div className="mb-3 bg-surface p-4 rounded-full">📦</div>
                    <span className="text-sm font-medium">محصولی یافت نشد.</span>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/50 transition-colors group">
                    
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelect(product.id)}
                      />
                    </td>

                    {/* Image */}
                    <td className="p-4 w-20">
                       <div className="w-14 h-14 rounded-xl bg-surface border border-gray-100 flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-300 text-xs">No Img</span>
                          )}
                        </div>
                    </td>

                    {/* Name & Category */}
                    <td className="p-4 max-w-[200px]">
                      <div className="font-bold text-primary text-sm truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 bg-surface inline-block px-2 py-0.5 rounded-md border border-gray-100">
                        {product.category_name || "---"}
                      </div>
                    </td>

                    {/* Technical Info */}
                    <td className="p-4 text-sm">
                      <div className="flex flex-col gap-1">
                         <span className="text-gray-700 text-xs">کد: <span className="font-mono text-primary font-semibold">{product.part_code}</span></span>
                         <span className="text-gray-500 text-xs">{product.brand} • {product.country_of_origin}</span>
                      </div>
                    </td>

                    {/* Price & Stock */}
                    <td className="p-4">
                      <div className="font-bold text-primary text-sm">{formatPrice(product.price)}</div>
                      <div className={`text-xs mt-1 font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} عدد` : 'ناموجود'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        product.is_active 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {product.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`edit/${product.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-primary hover:shadow-md transition-all" 
                          title="ویرایش"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- Footer Pagination --- */}
        <div className="bg-gray-50/50 p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <span>نمایش {products.length} رکورد</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 bg-white" disabled>قبلی</button>
            <button className="px-3 py-1 bg-primary text-accent font-bold rounded-lg shadow-sm">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white bg-white">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white bg-white">بعدی</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;