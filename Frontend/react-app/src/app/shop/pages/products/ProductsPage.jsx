import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useCars } from "../../hooks/useCars";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon, CheckIcon, ChevronDownIcon
} from "@heroicons/react/24/outline";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("category"); // category, car, sort
  
  // Local Filter States (applied instantly via processProducts)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  const { products, pagination, loading, fetchAllProducts, processProducts } = useProducts();
  const { categories } = useCategories(true);
  const { cars } = useCars(true);

  // Init Data
  useEffect(() => {
    fetchAllProducts().then(() => processProducts());
  }, [fetchAllProducts]);

  // Real-time Search Processing
  useEffect(() => {
    const timer = setTimeout(() => {
        processProducts({
            search: searchTerm,
            category: selectedCategory,
            car_model: selectedCar,
            ordering: selectedSort
        }, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedCar, selectedSort]);

  return (
    <div className="pb-28 min-h-screen bg-[#F9FAFB]">
      
      {/* 1. iOS Style Header */}
      <div className="sticky top-0 z-30 glass border-b border-gray-100/50 pt-2 pb-3 px-4 transition-all">
        <div className="flex gap-3 items-center max-w-lg mx-auto">
            
            {/* Search Pill */}
            <div className="relative flex-1 group">
                <input 
                    type="text" 
                    placeholder="جستجو..." 
                    className="w-full bg-gray-100/80 border-none rounded-full pl-10 pr-4 h-11 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-medium text-gray-700 placeholder-gray-400 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>

            {/* Filter Trigger */}
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`h-11 px-4 rounded-full flex items-center gap-2 text-sm font-bold transition-all active:scale-95 shadow-sm border ${
                    selectedCategory || selectedCar || selectedSort 
                    ? 'bg-primary text-white border-primary shadow-primary/20' 
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
            >
                <FunnelIcon className="w-5 h-5" />
                <span className="hidden sm:inline">فیلتر</span>
                {(selectedCategory || selectedCar || selectedSort) && (
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                )}
            </button>
        </div>
      </div>

      {/* 2. Product Grid */}
      <div className="container mx-auto px-4 mt-4 max-w-4xl">
        {loading && pagination.totalItems === 0 ? (
            <div className="py-32"><LoadingSpinner /></div>
        ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">نتیجه‌ای یافت نشد.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        )}
      </div>

      {/* 3. iOS Bottom Sheet (Filter/Sort) */}
      {isFilterOpen && (
        <>
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-slide-up-ios max-h-[85vh] flex flex-col">
                
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsFilterOpen(false)}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-black text-lg text-gray-800">فیلتر و مرتب‌سازی</h3>
                    <button 
                        onClick={() => {
                            setSelectedCategory("");
                            setSelectedCar("");
                            setSelectedSort("");
                        }} 
                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                    >
                        حذف همه
                    </button>
                </div>

                {/* Tabs (Segmented Control) */}
                <div className="px-6 mt-4">
                    <div className="bg-gray-100 p-1 rounded-xl flex text-sm font-bold text-gray-500">
                        <button 
                            onClick={() => setActiveTab("category")}
                            className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'category' ? 'bg-white text-primary shadow-sm' : 'hover:text-gray-700'}`}
                        >
                            دسته‌بندی
                        </button>
                        <button 
                            onClick={() => setActiveTab("car")}
                            className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'car' ? 'bg-white text-primary shadow-sm' : 'hover:text-gray-700'}`}
                        >
                            خودرو
                        </button>
                        <button 
                            onClick={() => setActiveTab("sort")}
                            className={`flex-1 py-2.5 rounded-lg transition-all ${activeTab === 'sort' ? 'bg-white text-primary shadow-sm' : 'hover:text-gray-700'}`}
                        >
                            مرتب‌سازی
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                    
                    {/* Categories List */}
                    {activeTab === 'category' && (
                        <div className="space-y-1">
                            <button 
                                onClick={() => setSelectedCategory("")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedCategory === "" ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <span>همه دسته‌ها</span>
                                {selectedCategory === "" && <CheckIcon className="w-5 h-5"/>}
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedCategory == cat.id ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <span>{cat.name}</span>
                                    {selectedCategory == cat.id && <CheckIcon className="w-5 h-5"/>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Cars List */}
                    {activeTab === 'car' && (
                        <div className="space-y-1">
                            <button 
                                onClick={() => setSelectedCar("")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedCar === "" ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <span>همه خودروها</span>
                                {selectedCar === "" && <CheckIcon className="w-5 h-5"/>}
                            </button>
                            {cars.map(car => (
                                <button 
                                    key={car.id}
                                    onClick={() => setSelectedCar(car.model)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedCar === car.model ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <span>{car.make} - {car.model}</span>
                                    {selectedCar === car.model && <CheckIcon className="w-5 h-5"/>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Sort Options */}
                    {activeTab === 'sort' && (
                        <div className="space-y-2">
                            {[
                                { label: "پیش‌فرض", val: "" },
                                { label: "جدیدترین", val: "-created_at" },
                                { label: "ارزان‌ترین", val: "price" },
                                { label: "گران‌ترین", val: "-price" },
                            ].map(opt => (
                                <button 
                                    key={opt.val}
                                    onClick={() => setSelectedSort(opt.val)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        selectedSort === opt.val 
                                        ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {selectedSort === opt.val && <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><CheckIcon className="w-3 h-3"/></div>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 pb-safe">
                    <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                    >
                        مشاهده نتایج
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;