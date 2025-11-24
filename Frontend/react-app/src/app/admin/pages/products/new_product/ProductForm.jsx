import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  getProductById,
  deleteProductImage,
} from "@/app/admin/api/ProductsApi";
import { getCategories } from "@/app/admin/api/CategoriesApi";
import { getCars } from "@/app/admin/api/CarsApi";

// Icons
import {
  PhotoIcon,
  CubeIcon,
  TagIcon,
  TruckIcon,
  ArrowRightIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import LoadingSpinner from "@/components/LoadingSpinner";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // ==================== States ====================
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Data Sources
  const [categories, setCategories] = useState([]);
  const [carsList, setCarsList] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    part_code: "",
    category: "",
    price: "",
    is_stock: true, // پیش‌فرض: موجود
    package_quantity: 1,
    description: "",
    brand: "",
    country_of_origin: "",
    warranty: "",
    is_active: true,
    allow_individual_sale: true,
    compatible_cars: [],
  });

  // Images State
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Error Handling
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  // ==================== Initial Data Loading ====================
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [catsData, carsData] = await Promise.all([
          getCategories(),
          getCars(),
        ]);
        setCategories(catsData.results || catsData);
        setCarsList(carsData.results || carsData);

        if (isEditMode) {
          const product = await getProductById(id);
          populateForm(product);
        }
      } catch (err) {
        console.error("Init Error:", err);
        setGlobalError("خطا در بارگذاری اطلاعات. لطفاً صفحه را رفرش کنید.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEditMode]);

  const populateForm = (product) => {
    setFormData({
      name: product.name || "",
      part_code: product.part_code || "",
      category: product.category || "",
      price: product.price ? parseInt(product.price) : "",
      is_stock: product.is_stock !== undefined ? product.is_stock : true,
      package_quantity: product.package_quantity || 1,
      description: product.description || "",
      brand: product.brand || "",
      country_of_origin: product.country_of_origin || "",
      warranty: product.warranty || "",
      is_active: product.is_active ?? true,
      allow_individual_sale: product.allow_individual_sale ?? true,
      compatible_cars: product.compatible_cars || [],
    });
    setExistingImages(product.images || []);
  };

  // ==================== Handlers ====================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCarToggle = (carId) => {
    setFormData((prev) => {
      const current = prev.compatible_cars;
      if (current.includes(carId)) {
        return { ...prev, compatible_cars: current.filter((c) => c !== carId) };
      } else {
        return { ...prev, compatible_cars: [...current, carId] };
      }
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imgId) => {
    if (!window.confirm("آیا از حذف این تصویر مطمئن هستید؟")) return;
    try {
      await deleteProductImage(id, imgId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
    } catch (err) {
      alert("خطا در حذف تصویر");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGlobalError(null);

    if (!formData.name || !formData.price || !formData.part_code) {
      setErrors({
        name: !formData.name ? "نام محصول الزامی است" : null,
        price: !formData.price ? "قیمت الزامی است" : null,
        part_code: !formData.part_code ? "کد فنی الزامی است" : null,
      });
      setSubmitting(false);
      // اسکرول به بالا برای دیدن ارورها
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const payload = { ...formData };
      let savedProduct;
      
      if (isEditMode) {
        savedProduct = await updateProduct(id, payload);
      } else {
        savedProduct = await createProduct(payload);
      }

      if (newImages.length > 0) {
        const { addProductImage } = await import("@/app/admin/api/ProductsApi");
        await Promise.all(
          newImages.map((file) => addProductImage(savedProduct.id, file, false))
        );
      }

      alert(isEditMode ? "محصول ویرایش شد" : "محصول جدید ایجاد شد");
      navigate("/admin/products");

    } catch (err) {
      console.error("Submit Error:", err);
      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          const val = backendErrors[key];
          formattedErrors[key] = Array.isArray(val) ? val.join(" ") : val;
        });
        setErrors(formattedErrors);
        setGlobalError("لطفاً موارد قرمز رنگ را بررسی کنید.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setGlobalError("خطای سرور: عملیات انجام نشد.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== UI Components ====================

  const FieldError = ({ name }) =>
    errors[name] && (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1 animate-fade-in">
        <ExclamationCircleIcon className="w-3 h-3" /> {errors[name]}
      </p>
    );

  const TabButton = ({ id, label, hasError }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`whitespace-nowrap flex-shrink-0 py-4 px-6 text-sm font-bold border-b-2 transition-all relative ${
        activeTab === id
          ? "border-accent text-primary bg-gray-50"
          : "border-transparent text-gray-500 hover:bg-gray-50"
      } ${hasError ? "text-red-500" : ""}`}
    >
      {label}
      {hasError && (
        <span className="absolute top-3 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  const hasErrorInGeneral = !!(errors.name || errors.part_code || errors.price || errors.category);
  const hasErrorInAttrs = !!(errors.brand || errors.country_of_origin);
  const hasErrorInRelations = !!errors.compatible_cars;

  return (
    <div className="pb-32 md:pb-24 animate-fade-in">
      
      {/* 1. Header (Stacked on mobile) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-800">
            {isEditMode ? `ویرایش: ${formData.name}` : "محصول جدید"}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            اطلاعات محصول را وارد کنید
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products")}
          className="self-start md:self-auto text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg md:bg-transparent md:p-0"
        >
          <ArrowRightIcon className="w-4 h-4" /> انصراف
        </button>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100 text-sm">
          <XCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{globalError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* 2. Scrollable Tabs (Mobile Optimized) */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          <TabButton
            id="general"
            label="اطلاعات عمومی"
            hasError={hasErrorInGeneral}
          />
          <TabButton
            id="attributes"
            label="ویژگی‌ها"
            hasError={hasErrorInAttrs}
          />
          <TabButton
            id="relations"
            label="دسته‌بندی و خودرو"
            hasError={hasErrorInRelations}
          />
          <TabButton id="images" label="تصاویر" hasError={false} />
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-8 min-h-[400px]">
          
          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
              
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نام محصول *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border text-sm md:text-base ${
                    errors.name
                      ? "border-red-300 bg-red-50 focus:ring-red-200"
                      : "border-gray-200 focus:ring-accent"
                  } focus:ring-2 outline-none transition-all`}
                  placeholder="نام کامل محصول..."
                />
                <FieldError name="name" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کد فنی *
                </label>
                <input
                  type="text"
                  name="part_code"
                  value={formData.part_code}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border text-sm md:text-base ${
                    errors.part_code ? "border-red-300" : "border-gray-200"
                  } focus:ring-2 focus:ring-accent outline-none font-mono text-left`}
                  dir="ltr"
                  placeholder="e.g. 58101-A7A00"
                />
                <FieldError name="part_code" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  قیمت (تومان) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border text-sm md:text-base ${
                    errors.price ? "border-red-300" : "border-gray-200"
                  } focus:ring-2 focus:ring-accent outline-none`}
                  placeholder="0"
                />
                <FieldError name="price" />
              </div>

              {/* Responsive Stock Toggle */}
              <div className="col-span-1 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">وضعیت موجودی</label>
                <div className={`w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.is_stock
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}>
                   <label className="flex items-center gap-3 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_stock"
                      checked={!!formData.is_stock}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm font-bold truncate ${
                          formData.is_stock ? "text-emerald-800" : "text-red-800"
                        }`}>
                        {formData.is_stock ? "موجود است" : "ناموجود"}
                      </span>
                    </div>
                   </label>
                   <div className={`p-2 rounded-full flex-shrink-0 ${
                      formData.is_stock ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                    }`}>
                    <CubeIcon className="w-5 h-5" />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تعداد در بسته
                </label>
                <input
                  type="number"
                  name="package_quantity"
                  value={formData.package_quantity}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm md:text-base"
                />
              </div>

              {/* Stacked Checkboxes on Mobile */}
              <div className="col-span-2 flex flex-col sm:flex-row gap-4 mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-accent rounded focus:ring-accent"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    نمایش در سایت (فعال)
                  </span>
                </label>

                <div className="hidden sm:block w-px bg-gray-300 h-6"></div>

                <label className="flex items-center gap-3 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    name="allow_individual_sale"
                    checked={formData.allow_individual_sale}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-accent rounded focus:ring-accent"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    امکان فروش تکی
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Attributes */}
          {activeTab === "attributes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  برند / سازنده
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm md:text-base"
                />
                <FieldError name="brand" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کشور سازنده
                </label>
                <input
                  type="text"
                  name="country_of_origin"
                  value={formData.country_of_origin}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm md:text-base"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گارانتی
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm md:text-base"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm md:text-base"
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 3: Relations */}
          {activeTab === "relations" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دسته‌بندی *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border ${
                      errors.category ? "border-red-300" : "border-gray-200"
                    } focus:ring-2 focus:ring-accent outline-none bg-white appearance-none text-sm md:text-base`}
                  >
                    <option value="">--- انتخاب کنید ---</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <TagIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                <FieldError name="category" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                   خودروهای سازگار ({formData.compatible_cars.length})
                </label>
                <div
                  className={`border rounded-xl p-3 max-h-80 overflow-y-auto ${
                    errors.compatible_cars ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {carsList.map((car) => (
                      <label
                        key={car.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer active:scale-95 transition-all ${
                          formData.compatible_cars.includes(car.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.compatible_cars.includes(car.id)}
                          onChange={() => handleCarToggle(car.id)}
                          className="w-5 h-5 text-accent rounded focus:ring-accent flex-shrink-0"
                        />
                        <div className="text-sm">
                          <span className="font-bold text-gray-800 block">
                            {car.make} {car.model}
                          </span>
                          <span className="text-xs text-gray-500">
                            {car.year}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <FieldError name="compatible_cars" />
              </div>
            </div>
          )}

          {/* TAB 4: Images */}
          {activeTab === "images" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-accent hover:bg-yellow-50/20 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <CloudArrowUpIcon className="w-10 h-10" />
                  <p className="font-bold text-sm">افزودن تصویر</p>
                  <p className="text-xs opacity-70">JPG, PNG (Max 2MB)</p>
                </div>
              </div>

              {/* Image Grids (Responsive) */}
              {(existingImages.length > 0 || newImages.length > 0) && (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square border rounded-lg overflow-hidden group">
                        <img src={img.image_url} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                        {img.is_main && (
                           <span className="absolute bottom-0 inset-x-0 bg-accent text-primary text-[10px] text-center font-bold">اصلی</span>
                        )}
                      </div>
                    ))}
                    {newImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square border-2 border-green-200 rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" alt="" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Sticky Footer Action Bar (Mobile Optimized) */}
        <div className="bg-white border-t border-gray-200 p-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 flex justify-center items-center gap-2 transition-all active:scale-95 ${
              submitting ? "opacity-70 cursor-wait" : "hover:bg-primary-light"
            }`}
          >
            {submitting ? "در حال ذخیره..." : (isEditMode ? "ذخیره تغییرات" : "ایجاد محصول")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;