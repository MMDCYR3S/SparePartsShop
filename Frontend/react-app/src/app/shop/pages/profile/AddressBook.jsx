// src/app/shop/pages/profile/AddressBook.jsx
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/app/shop/hooks/useCustomer";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Plus, MapPin, Trash2, Edit2, X, Loader2 
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const AddressBook = () => {
  const { addresses, fetchAddresses, addAddress, removeAddress, loadingAddresses } = useCustomer();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [newAddr, setNewAddr] = useState({
    province: "", city: "", street: "", postal_code: "", detail: ""
  });

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await addAddress(newAddr);
    setSubmitting(false);
    
    if (result.success) {
      setIsModalOpen(false);
      setNewAddr({ province: "", city: "", street: "", postal_code: "", detail: "" });
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("حذف آدرس؟")) {
        await removeAddress(id);
    }
  };

  return (
    <div className="pb-24 animate-fade-in relative min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">آدرس‌های من</h1>
      </div>

      {loadingAddresses ? (
        <LoadingSpinner />
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 opacity-50">
            <MapPin size={48} className="mx-auto mb-4" />
            <p>هیچ آدرسی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{addr.province}، {addr.city}</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                {addr.street} {addr.detail}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-2">کد پستی: {addr.postal_code}</p>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-4 border-t border-gray-50 pt-3">
                        <button onClick={() => handleDelete(addr.id)} className="text-red-500 text-xs font-bold flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-red-50">
                            <Trash2 size={14} /> حذف
                        </button>
                        {/* دکمه ویرایش رو میتونید مشابه افزودن اضافه کنید */}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary text-accent rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Add Address Modal (Bottom Sheet Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-2xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">افزودن آدرس جدید</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            placeholder="استان" 
                            className="input-field w-full"
                            value={newAddr.province}
                            onChange={e => setNewAddr({...newAddr, province: e.target.value})}
                            required 
                        />
                        <input 
                            placeholder="شهر" 
                            className="input-field w-full"
                            value={newAddr.city}
                            onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                            required 
                        />
                    </div>
                    <textarea 
                        placeholder="نشانی دقیق (خیابان، کوچه، پلاک...)" 
                        className="input-field w-full min-h-[80px]" 
                        value={newAddr.street}
                        onChange={e => setNewAddr({...newAddr, street: e.target.value})}
                        required
                    ></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            placeholder="کد پستی" 
                            type="number" 
                            className="input-field w-full" 
                            value={newAddr.postal_code}
                            onChange={e => setNewAddr({...newAddr, postal_code: e.target.value})}
                        />
                        <input 
                            placeholder="جزئیات (واحد، زنگ)" 
                            className="input-field w-full" 
                            value={newAddr.detail}
                            onChange={e => setNewAddr({...newAddr, detail: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-3.5 bg-primary text-white rounded-xl font-bold mt-4 flex justify-center items-center gap-2"
                    >
                        {submitting && <Loader2 className="animate-spin" />}
                        ثبت آدرس
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;