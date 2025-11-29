import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useCars } from "../../hooks/useCars";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon, CheckIcon, 
  ChevronLeftIcon, ChevronRightIcon, TagIcon
} from "@heroicons/react/24/outline";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State های لوکال
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  const { 
    products, 
    allProducts, 
    pagination, 
    loading, 
    fetchAllProducts, 
    processProducts 
  } = useProducts();
  
  // لود خودکار دسته‌بندی‌ها و ماشین‌ها
  const { categories } = useCategories(true);
  const { cars } = useCars(true);

  // 1. لود اولیه دیتا
  useEffect(() => {
    const init = async () => {
      await fetchAllProducts();
    };
    init();
  }, [fetchAllProducts]);

  // 2. پردازش دیتا (هر وقت ورودی‌ها یا دیتای اصلی تغییر کرد)
  useEffect(() => {
    const timer = setTimeout(() => {
        processProducts({
            search: searchTerm,
            category: selectedCategory,
            car_model: selectedCar,
            ordering: selectedSort
        }, pagination.currentPage);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedCar, selectedSort, pagination.currentPage, allProducts, processProducts]);

  // تغییر صفحه
  const handlePageChange = (newPage) => {
    processProducts({
        search: searchTerm,
        category: selectedCategory,
        car_model: selectedCar,
        ordering: selectedSort
    }, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // تعیین وضعیت نمایش
  const showLoading = loading && allProducts.length === 0;
  const showEmpty = !loading && products.length === 0 && allProducts.length > 0;

  return (
    <div className="pb-28 min-h-screen bg-[#F9FAFB]">
      
      {/* 1. Header Sticky */}
      <div className="sticky top-0 z-30 glass border-b border-gray-100/50 pt-3 pb-2 px-4 transition-all">
        <div className="flex gap-3 items-center max-w-lg mx-auto mb-3">
            {/* Search Bar */}
            <div className="relative flex-1 group">
                <input 
                    type="text" 
                    placeholder="جستجو..." 
                    className="w-full bg-gray-100/80 border-none rounded-full pl-10 pr-10 h-11 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-medium text-gray-700 placeholder-gray-400 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if(pagination.currentPage !== 1) handlePageChange(1); 
                    }}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-gray-400 p-0.5">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Trigger Button */}
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`h-11 px-4 rounded-full flex items-center gap-2 text-sm font-bold transition-all active:scale-95 shadow-sm border ${
                    selectedCategory || selectedCar || selectedSort 
                    ? 'bg-primary text-white border-primary shadow-primary/20' 
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
            >
                <FunnelIcon className="w-5 h-5" />
                {(selectedCategory || selectedCar || selectedSort) && (
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                )}
            </button>
        </div>

        {/* 2. Horizontal Categories (Always Visible) */}
        {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                <button 
                    onClick={() => setSelectedCategory("")}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selectedCategory === "" 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    همه
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)} // یا cat.id بسته به دیتای محصول
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            selectedCategory === cat.name 
                            ? 'bg-primary text-white border-primary shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* 3. Product List */}
      <div className="container mx-auto px-4 mt-4 max-w-4xl">
        {showLoading ? (
            <div className="py-32 flex justify-center"><LoadingSpinner /></div>
        ) : showEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-bold">نتیجه‌ای یافت نشد.</p>
                <button onClick={() => {setSearchTerm(""); setSelectedCategory("");}} className="mt-4 text-primary text-sm font-bold border-b border-primary border-dashed">
                    پاک کردن تمام فیلترها
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        )}
      </div>

      {/* 4. Pagination Controls */}
      {!loading && products.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-8 px-4 pb-safe" dir="ltr">
            <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 disabled:shadow-none active:scale-90 transition-all hover:bg-gray-50"
            >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex gap-1 items-center bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-sm font-black text-primary w-6 text-center">
                    {pagination.currentPage}
                </span>
                <span className="text-gray-300">/</span>
                <span className="text-xs font-bold text-gray-500 w-6 text-center">
                    {pagination.totalPages}
                </span>
            </div>
            
            <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 disabled:shadow-none active:scale-90 transition-all hover:bg-gray-50"
            >
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
            </button>
        </div>
      )}

      {/* 5. Filter Modal (Bottom Sheet) */}
      {isFilterOpen && (
        <>
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-slide-up-ios max-h-[85vh] flex flex-col">
                
                {/* Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsFilterOpen(false)}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-black text-lg text-gray-800">فیلتر و مرتب‌سازی</h3>
                    <button onClick={() => { setSelectedCategory(""); setSelectedCar(""); setSelectedSort(""); }} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                        حذف همه
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 mt-4">
                    <div className="bg-gray-100 p-1 rounded-xl flex text-sm font-bold text-gray-500">
                        <button onClick={() => setActiveTab("category")} className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'category' ? 'bg-white text-primary shadow-sm' : ''}`}>دسته‌بندی</button>
                        <button onClick={() => setActiveTab("car")} className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'car' ? 'bg-white text-primary shadow-sm' : ''}`}>خودرو</button>
                        <button onClick={() => setActiveTab("sort")} className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'sort' ? 'bg-white text-primary shadow-sm' : ''}`}>مرتب‌سازی</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                    {activeTab === 'category' && (
                        <div className="space-y-1">
                            <button onClick={() => setSelectedCategory("")} className={`w-full flex justify-between p-3 rounded-xl transition-colors ${selectedCategory==="" ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <span>همه</span> {selectedCategory==="" && <CheckIcon className="w-5 h-5"/>}
                            </button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`w-full flex justify-between p-3 rounded-xl transition-colors ${selectedCategory===cat.name ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{cat.name}</span> {selectedCategory===cat.name && <CheckIcon className="w-5 h-5"/>}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'car' && (
                        <div className="space-y-1">
                            <button onClick={() => setSelectedCar("")} className={`w-full flex justify-between p-3 rounded-xl transition-colors ${selectedCar==="" ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <span>همه خودروها</span> {selectedCar==="" && <CheckIcon className="w-5 h-5"/>}
                            </button>
                            {cars.map(car => (
                                <button key={car.id} onClick={() => setSelectedCar(car.model)} className={`w-full flex justify-between p-3 rounded-xl transition-colors ${selectedCar===car.model ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{car.make} - {car.model}</span> {selectedCar===car.model && <CheckIcon className="w-5 h-5"/>}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'sort' && (
                        <div className="space-y-2">
                            {[
                                {label: "پیش‌فرض", val: ""},
                                {label: "جدیدترین", val: "-created_at"},
                                {label: "ارزان‌ترین", val: "price"},
                                {label: "گران‌ترین", val: "-price"},
                            ].map(opt => (
                                <button key={opt.val} onClick={() => setSelectedSort(opt.val)} className={`w-full flex justify-between p-4 rounded-xl border transition-all ${selectedSort===opt.val ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' : 'border-gray-100 bg-white text-gray-600'}`}>
                                    <span>{opt.label}</span> {selectedSort===opt.val && <CheckIcon className="w-5 h-5 bg-primary text-white rounded-full p-1"/>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 pb-safe">
                    <button onClick={() => setIsFilterOpen(false)} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                        مشاهده نتایج ({pagination.totalItems} محصول)
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;