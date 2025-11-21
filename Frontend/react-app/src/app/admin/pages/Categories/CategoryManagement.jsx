import React, { useState, useEffect } from 'react';
import { 
  getCategories, createCategory, updateCategory, deleteCategory, bulkDeleteCategories 
} from '../../api/CategoriesApi';
import { 
  getCars, createCar, updateCar, deleteCar, bulkDeleteCars 
} from '../../api/CarsApi';

import { 
  PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon,
  TagIcon, TruckIcon, ChevronUpIcon, ChevronDownIcon, XCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';

const CategoryManagement = () => {
  // ==================== State ====================
  const [activeTab, setActiveTab] = useState('categories');
  const [dataList, setDataList] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // اصلاح 1: مقدار اولیه همه فیلدها باید رشته خالی باشه تا ارور controlled نده
  const [formData, setFormData] = useState({ 
    name: '', 
    parent: '', 
    model: '', 
    year: '' 
  });

  // ==================== Effects ====================
  
  useEffect(() => {
    setOrdering('');
    setSelectedIds(new Set());
    setSearch('');
    setFormData({ name: '', parent: '', model: '', year: '' });
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, search, ordering]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { search, ordering };
      let result = [];

      if (activeTab === 'categories') {
        result = await getCategories(params);
        if (!search) setParentCategories(result); 
      } else {
        result = await getCars(params);
      }
      setDataList(result);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Handlers ====================

  const handleSort = (field) => {
    let sortField = field;
    if (activeTab === 'cars' && field === 'name') sortField = 'make';

    if (ordering === sortField) {
      setOrdering(`-${sortField}`);
    } else {
      setOrdering(sortField);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      if (activeTab === 'categories') {
        setFormData({ 
          name: item.name || '', 
          parent: item.parent || '', 
          model: '', 
          year: '' 
        });
      } else {
        setFormData({ 
          name: item.make || '', 
          model: item.model || '', 
          year: item.year || '', // پر کردن سال
          parent: '' 
        });
      }
    } else {
      // ریست کامل فرم برای آیتم جدید
      setFormData({ name: '', parent: '', model: '', year: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'categories') {
        // --- Categories ---
        const payload = { 
          name: formData.name, 
          parent: formData.parent ? parseInt(formData.parent) : null 
        };
        if (editingItem) await updateCategory(editingItem.id, payload);
        else await createCategory(payload);

      } else {
        // --- Cars ---
        // اصلاح 2: استفاده از editingItem.id به جای item.id
        const payload = { 
          make: formData.name, 
          model: formData.model,
          year: formData.year ? parseInt(formData.year) : new Date().getFullYear()
        };
        
        if (editingItem) await updateCar(editingItem.id, payload);
        else await createCar(payload);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        alert(`خطای اعتبارسنجی: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("خطا در ذخیره سازی اطلاعات.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف مطمئن هستید؟")) return;
    try {
      if (activeTab === 'categories') await deleteCategory(id);
      else await deleteCar(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("خطا در حذف آیتم (احتمالاً وابستگی دارد).");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`آیا از حذف ${selectedIds.size} مورد اطمینان دارید؟`)) return;
    try {
      const ids = Array.from(selectedIds);
      if (activeTab === 'categories') await bulkDeleteCategories(ids);
      else await bulkDeleteCars(ids);
      
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error(error);
      alert("خطا در حذف گروهی.");
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // ==================== Components ====================
  
  const SortableHeader = ({ label, field }) => {
    let checkField = field;
    if (activeTab === 'cars' && field === 'name') checkField = 'make';

    const isSorted = ordering === checkField || ordering === `-${checkField}`;
    const isDesc = ordering === `-${checkField}`;

    return (
      <th 
        onClick={() => handleSort(field)}
        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors select-none group"
      >
        <div className="flex items-center gap-1">
          {label}
          <div className="flex flex-col text-gray-400 group-hover:text-accent">
            <ChevronUpIcon className={`w-3 h-3 ${isSorted && !isDesc ? 'text-primary font-bold' : ''}`} />
            <ChevronDownIcon className={`w-3 h-3 ${isSorted && isDesc ? 'text-primary font-bold' : ''}`} />
          </div>
        </div>
      </th>
    );
  };

  // ==================== Render ====================
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">مدیریت طبقه‌بندی‌ها</h1>
          <p className="text-sm text-gray-500">مدیریت دسته‌بندی‌های قطعات و انواع خودروها</p>
        </div>
        <div className="bg-white p-1.5 rounded-xl border border-gray-200 flex shadow-sm">
          <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'categories' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <TagIcon className="w-5 h-5" /> دسته‌بندی‌ها
          </button>
          <button onClick={() => setActiveTab('cars')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'cars' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <TruckIcon className="w-5 h-5" /> خودروها
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder={activeTab === 'categories' ? "جستجو در دسته‌ها..." : "جستجو در برندها..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-accent rounded-xl transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 justify-end">
          {selectedIds.size > 0 && (
            <>
               <button onClick={deselectAll} className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 font-medium transition-colors">
                <XCircleIcon className="w-5 h-5" /> لغو ({selectedIds.size})
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 font-medium transition-colors">
                <TrashIcon className="w-5 h-5" /> حذف گروهی
              </button>
            </>
          )}
          
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">
            <PlusIcon className="w-5 h-5" /> افزودن {activeTab === 'categories' ? 'دسته' : 'خودرو'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <tr>
                  <th className="p-4 w-10">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  </th>
                  
                  <SortableHeader label={activeTab === 'categories' ? 'نام دسته‌بندی' : 'برند (Make)'} field="name" />
                  
                  {activeTab === 'categories' ? (
                     <th className="p-4">والد (Parent)</th>
                  ) : (
                     <SortableHeader label="مدل (Model)" field="model" />
                  )}

                  {activeTab === 'categories' && <th className="p-4">Slug</th>}
                  
                  {activeTab === 'cars' && <SortableHeader label="سال ساخت" field="year" />}

                  <SortableHeader label="تاریخ ایجاد" field="created_at" />
                  
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataList.length === 0 ? (
                  <tr><td colSpan="10" className="p-8 text-center text-gray-400">داده‌ای یافت نشد</td></tr>
                ) : (
                  dataList.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(item.id)} 
                          onChange={() => toggleSelect(item.id)} 
                          className="rounded text-accent focus:ring-accent cursor-pointer w-4 h-4" 
                        />
                      </td>
                      
                      <td className="p-4 font-bold text-gray-700">
                        {activeTab === 'categories' ? item.name : item.make}
                      </td>

                      <td className="p-4">
                        {activeTab === 'categories' ? (
                          item.parent_name ? <span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.parent_name}</span> : <span className="text-gray-300 text-xs">--</span>
                        ) : (
                          <span className="font-mono text-gray-600 bg-yellow-50 px-2 py-1 rounded text-xs">{item.model || '-'}</span>
                        )}
                      </td>
                      
                      {activeTab === 'categories' && <td className="p-4 text-gray-400 font-mono text-xs">{item.slug}</td>}
                      
                      {activeTab === 'cars' && <td className="p-4 text-gray-600 text-xs">{item.year}</td>}

                      <td className="p-4 text-gray-500 text-sm ltr" dir="ltr">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('fa-IR') : '-'}
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="ویرایش">
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? 'ویرایش' : 'افزودن'} {activeTab === 'categories' ? 'دسته‌بندی' : 'خودرو'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === 'categories' ? 'نام دسته‌بندی' : 'برند خودرو (Make)'}
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  placeholder={activeTab === 'categories' ? "مثلاً: جلوبندی" : "مثلاً: Kia"}
                />
              </div>

              {activeTab === 'categories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">دسته والد</label>
                  <select value={formData.parent} onChange={(e) => setFormData({...formData, parent: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent bg-white">
                    <option value="">--- دسته اصلی (ریشه) ---</option>
                    {parentCategories.filter(c => c.id !== editingItem?.id).map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
              )}

              {activeTab === 'cars' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مدل خودرو (Model)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.model} 
                      onChange={(e) => setFormData({...formData, model: e.target.value})} 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                      placeholder="مثلاً: Optima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">سال ساخت</label>
                    <input 
                      type="number" 
                      required
                      value={formData.year} 
                      onChange={(e) => setFormData({...formData, year: e.target.value})} 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                      placeholder="مثلاً: 1403"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">انصراف</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-light shadow-lg shadow-primary/20">
                  {editingItem ? 'ذخیره تغییرات' : 'ثبت نهایی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;