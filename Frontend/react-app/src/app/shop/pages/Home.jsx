import React from 'react';

const HomePage = () => {
    return (
        <div className="text-center py-20">
            <h1 className="text-4xl font-extrabold text-primary mb-4">به فروشگاه قطعات یدکی خوش آمدید</h1>
            <p className="text-xl text-gray-600 mb-8">بهترین قطعات با گارانتی اصالت کالا</p>
            <button className="bg-accent text-primary font-bold py-3 px-8 rounded-full hover:bg-accent-hover transition shadow-lg">
                مشاهده محصولات
            </button>
        </div>
    )
}
export default HomePage;