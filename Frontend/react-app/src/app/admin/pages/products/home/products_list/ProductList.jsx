import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  patchProduct,
} from "@/app/admin/api/ProductsApi";

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

import LoadingSpinner from "@/components/LoadingSpinner";

// ==================== کامپوننت کمکی برای نمایش خطا ====================
const ErrorBanner = ({ error, onRetry }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 animate-fade-in">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon
          className="h-6 w-6 text-red-500"
          aria-hidden="true"
        />
      </div>
      <div className="mr-3 w-full">
        <h3 className="text-sm font-bold text-red-800">
          خطا در بارگذاری اطلاعات
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{error.userMessage}</p>
        </div>
        {/* بخش دیباگ فنی - برای توسعه دهنده */}
        <div
          className="mt-3 p-3 bg-red-100 rounded text-xs font-mono text-red-900 overflow-x-auto ltr"
          dir="ltr"
        >
          <strong>Technical Details:</strong> {error.technicalMessage}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-200 hover:bg-red-300 focus:outline-none transition-colors"
          >
            <ArrowPathIcon className="ml-2 -mr-0.5 h-4 w-4" /> تلاش مجدد
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ProductList = () => {
  const navigate = useNavigate();

  // ==================== States ====================
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { userMessage, technicalMessage }

  // فیلتر و جستجو
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState(""); // '-price', 'name', etc.

  // انتخاب چندگانه
  const [selectedIds, setSelectedIds] = useState(new Set());

  // صفحه بندی (فعلا کلاینت ساید تا وقتی بکند صفحه بندی رو اضافه کنه)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");

  // ==================== Data Fetching ====================

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // پارامترهای API
      const params = {
        search: search || undefined,
        ordering: ordering || undefined,
      };

      const data = await getProducts(params);

      // هندل کردن فرمت‌های مختلف پاسخ (آرایه خالی یا آبجکت)
      // اگر بکند Pagination داشته باشه data.results میاد، اگه نه خود data آرایست
      const list = Array.isArray(data) ? data : data.results || [];

      setProducts(list);
      console.log(products);

      // اگر صفحه‌ای که هستیم خالی شد، برگردیم صفحه ۱
      if (
        list.length > 0 &&
        currentPage > Math.ceil(list.length / itemsPerPage)
      ) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Product Fetch Error:", err);
      // ساختن آبجکت خطای تمیز
      setError({
        userMessage:
          "ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید یا با پشتیبانی تماس بگیرید.",
        technicalMessage: err.response
          ? `Status: ${err.response.status} | Data: ${JSON.stringify(
              err.response.data
            )}`
          : err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [search, ordering]);

  // اجرای اولیه و هنگام تغییر فیلترها
  useEffect(() => {
    // دیبانس برای سرچ که هر لحظه درخواست نفرسته
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // ==================== Handlers ====================

  const handleSort = (field) => {
    if (ordering === field) setOrdering(`-${field}`);
    else setOrdering(field);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // فقط آیتم‌های صفحه جاری رو انتخاب میکنیم یا همه؟ اینجا همه رو انتخاب میکنیم
      const allIds = products.map((p) => p.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "آیا از حذف این محصول اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
      )
    )
      return;

    try {
      await deleteProduct(id);
      // آپدیت لوکال برای سرعت بیشتر
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      alert("خطا در حذف محصول: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `آیا از حذف ${selectedIds.size} محصول انتخاب شده اطمینان دارید؟`
      )
    )
      return;

    try {
      await bulkDeleteProducts(Array.from(selectedIds));
      fetchData(); // رفرش کامل
      setSelectedIds(new Set());
    } catch (err) {
      alert("خطا در حذف گروهی.");
    }
  };

  const handleToggleActive = async (product) => {
    try {
      // اینجا ما تک آیتم رو آپدیت میکنیم ولی از متد bulk یا patch تکی استفاده میکنیم
      // چون متد patch تکی داریم از اون استفاده میکنیم
      /* 
         نکته: اگر متد patchProduct داری از اون استفاده کن، 
         اگر نه از bulkUpdateProductStatus برای یک آیتم استفاده کن.
         من اینجا فرض میکنم patchProduct رو داریم یا از bulk استفاده میکنیم.
      */
      await bulkUpdateProductStatus([product.id], !product.is_active);

      // آپدیت لوکال
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !product.is_active } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت محصول.");
    }
  };

  const handleToggleStock = async (product) => {
    try {
      const newStockStatus = !product.is_stock;

      // آپدیت سریع در ظاهر (Optimistic UI)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_stock: newStockStatus } : p
        )
      );

      // ارسال به سرور
      await patchProduct(product.id, { is_stock: newStockStatus });
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت موجودی.");
      fetchData(); // برگرداندن تغییرات در صورت خطا
    }
  };

  const handlePriceDoubleClick = (product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price); // مقدار فعلی را داخل اینپوت می‌ریزم
  };

  const handleSavePrice = async (id) => {
    if (editingPriceId === null) return;

    try {
      // اگر تغییری نکرده بود، فقط ببند
      const currentProduct = products.find((p) => p.id === id);
      if (currentProduct.price == tempPrice) {
        setEditingPriceId(null);
        return;
      }

      // آپدیت لوکال
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: tempPrice } : p))
      );
      setEditingPriceId(null);

      // ارسال به سرور
      await patchProduct(id, { price: tempPrice });
    } catch (err) {
      alert("خطا در ویرایش قیمت");
      fetchData();
    }
  };

  // ۴. هندل کردن کلید Enter در اینپوت قیمت
  const handlePriceKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSavePrice(id);
    }
  };

  // ==================== Pagination Logic (Client Side) ====================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // ==================== Helper Components ====================

  const Th = ({ field, label, sortable = true }) => (
    <th
      className={`px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider ${
        sortable ? "cursor-pointer hover:bg-gray-50 group" : ""
      }`}
      onClick={() => sortable && handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortable && (
          <ArrowsUpDownIcon
            className={`w-4 h-4 transition-colors ${
              ordering.includes(field)
                ? "text-accent"
                : "text-gray-300 group-hover:text-gray-400"
            }`}
          />
        )}
      </div>
    </th>
  );

  // ==================== Render ====================

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary">محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت انبار و لیست قطعات یدکی
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          محصول جدید
        </button>
      </div>

      {/* 2. Error Banner (Conditional) */}
      {error && <ErrorBanner error={error} onRetry={fetchData} />}

      {/* 3. Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در نام، کد فنی، برند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-accent focus:border-accent block pr-10 pl-2.5 py-2.5 transition-all"
          />
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-2 rounded-lg">
                {selectedIds.size} انتخاب شده
              </span>
              <button
                onClick={handleBulkDelete}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="حذف گروهی"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="h-8 w-[1px] bg-gray-200 hidden lg:block"></div>

          <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">
            <FunnelIcon className="w-5 h-5" />
            فیلترها
          </button>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center flex-col gap-4">
            <LoadingSpinner />
            <p className="text-gray-400 text-sm animate-pulse">
              در حال دریافت اطلاعات محصولات...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        currentItems.length > 0 &&
                        selectedIds.size === products.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    تصویر
                  </th>
                  <Th field="name" label="نام محصول / کد فنی" />
                  <Th field="category" label="دسته‌بندی" />
                  <Th field="price" label="قیمت (تومان)" />
                  <Th field="stock_quantity" label="موجودی" />
                  <Th field="is_active" label="وضعیت" />
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ArchiveBoxIcon className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          هیچ محصولی یافت نشد.
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="text-accent hover:underline text-sm"
                          >
                            پاک کردن جستجو
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-blue-50/30 transition-colors group ${
                        !product.is_active
                          ? "bg-gray-50/50 grayscale-[0.5]"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                          className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-lg border border-gray-200 bg-white p-1 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={
                                product.images.find((img) => img.is_main)
                                  ?.image_url || product.images[0].image_url
                              }
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                              بدون عکس
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm line-clamp-1">
                            {product.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono mt-1 bg-gray-100 px-2 py-0.5 rounded w-fit">
                            {product.part_code || "---"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {product.category_name || "بدون دسته"}
                        </span>
                        {product.brand && (
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {product.brand}
                          </span>
                        )}
                      </td>
                      <td
                        className="px-6 py-4"
                        onDoubleClick={() => handlePriceDoubleClick(product)}
                      >
                        {editingPriceId === product.id ? (
                          <input
                            type="number"
                            autoFocus
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onBlur={() => handleSavePrice(product.id)} // وقتی موس رفت کنار ذخیره شه
                            onKeyDown={(e) => handlePriceKeyDown(e, product.id)} // با اینتر ذخیره شه
                            className="w-24 px-2 py-1 text-sm border border-blue-400 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        ) : (
                          <span
                            className="font-mono font-medium text-gray-700 cursor-pointer select-none hover:text-blue-600"
                            title="دبل کلیک برای ویرایش"
                          >
                            {product.price
                              ? parseInt(product.price).toLocaleString()
                              : "0"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                            product.is_stock == true
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                              : "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                          }`}
                        >
                          {product.is_stock == true ? "موجود" : "ناموجود"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            product.is_active
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {product.is_active ? (
                            <>
                              <CheckCircleIcon className="w-3.5 h-3.5" /> فعال
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3.5 h-3.5" /> غیرفعال
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              navigate(`/admin/products/view/${product.id}`)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            title="مشاهده جزئیات"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="ویرایش"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            title="حذف"
                          >
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

        {/* Pagination Footer */}
        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              نمایش {indexOfFirstItem + 1} تا{" "}
              {Math.min(indexOfLastItem, products.length)} از {products.length}{" "}
              محصول
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                قبلی
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded border text-sm flex items-center justify-center transition-colors ${
                    currentPage === i + 1
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
