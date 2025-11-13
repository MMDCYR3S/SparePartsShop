from django.views.generic import TemplateView

# ======== Banner View ========= #
class BannerView(TemplateView):
    """ نمایش بنر صفحه اصلی """
    
    template_name = "admin/banners/banners.html"

# ======== Category View ========= #
class CategoryView(TemplateView):
    """ نمایش دسته بندی های صفحه اصلی """
    
    template_name = "admin/categories/categories.html"
    
# ======== Car View ========= #
class CarView(TemplateView):
    """ نمایش خودروهای صفحه اصلی """
    
    template_name = "admin/cars/cars.html"
    
# ======== Product View ========= #
class ProductView(TemplateView):
    """ نمایش محصولات صفحه اصلی """
    
    template_name = "admin/products/products.html"
    
# ======== Product Form View ========= #
class ProductFormView(TemplateView):
    """ نمایش فرم محصولات صفحه اصلی """
    
    template_name = "admin/products/product_form.html"
    
# ======== Orders View ========= #
class OrdersView(TemplateView):
    """ نمایش سفارشات صفحه اصلی """
    
    template_name = "admin/orders/orders.html"
    
# ======== Orders Form View ========= #
class OrdersFormView(TemplateView):
    """ نمایش فرم سفارشات صفحه اصلی """
    
    template_name = "admin/orders/order_form.html"

# ======== Users View ========= #
class UsersView(TemplateView):
    """ نمایش کاربران صفحه اصلی """
    
    template_name = "admin/users/users.html"

# ======== Users Form View ========= #
class UsersFormView(TemplateView):
    """ نمایش فرم کاربران صفحه اصلی """
    
    template_name = "admin/users/user_form.html"
    
# ======== Payments View =========#
class PaymentsView(TemplateView):
    """ نمایش پرداخت ها صفحه اصلی """
    
    template_name = "admin/payments/payments.html"
    
# ======== Payments Form View =========#
class PaymentsFormView(TemplateView):
    """ نمایش فرم پرداخت ها صفحه اصلی """
    
    template_name = "admin/payments/payment_form.html"

# ======== Dashboard View ========= #
class DashboardView(TemplateView):
    """ نمایش داشبورد صفحه اصلی """
    
    template_name = "admin/dashboard/index.html"
