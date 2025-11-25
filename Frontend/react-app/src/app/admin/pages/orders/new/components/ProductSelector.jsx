// src/app/admin/pages/orders/new/components/ProductSelector.jsx
import React, { useState, useEffect } from "react";
import { getProducts } from "@/app/admin/api/ProductsApi";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

const ProductSelector = ({ onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getProducts({ search });
        setProducts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("خطا در دریافت محصولات", err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-gray-700 mb-3 text-sm">افزودن محصول به سفارش</h3>
      
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="جستجوی محصول (نام، کد فنی)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-center text-xs text-gray-400 py-4">در حال جستجو...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">محصولی یافت نشد.</p>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                        <img src={product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        <span className="bg-gray-100 px-1 rounded">{product.part_code}</span>
                        
                        {/* اصلاح بخش نمایش موجودی */}
                        <span className={`px-2 py-0.5 rounded ${product.is_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {product.is_stock ? 'موجود' : 'ناموجود'}
                        </span>
                    </div>
                 </div>
              </div>
              
              <button
                type="button"
                onClick={() => onAddProduct(product)}
                disabled={!product.is_stock}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="افزودن به لیست"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductSelector;