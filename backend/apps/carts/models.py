from django.db import models
from django.contrib.auth import get_user_model

from apps.shop.models import Product

User = get_user_model()

# ========= Cart Model ========= #
class Cart(models.Model):
    """
    مدل سبد خرید برای هر کاربر
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="کاربر")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return f"سبد خرید {self.user.username}"

    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"

# ========= CartItem Model ========= #
class CartItem(models.Model):
    """
    مدل آیتم‌های داخل یک سبد خرید
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name="سبد خرید")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="محصول")
    quantity = models.PositiveIntegerField(default=1, verbose_name="تعداد")

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart.user.username}'s cart"

    class Meta:
        verbose_name = "آیتم سبد خرید"
        verbose_name_plural = "آیتم‌های سبد خرید"
        unique_together = ('cart', 'product')
