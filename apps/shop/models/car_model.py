from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# ========= Car Model ========= #
class Car(models.Model):
    """
    مدل برای ذخیره اطلاعات خودروها جهت اتصال به محصولات
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars', verbose_name="کاربر")
    make = models.CharField(max_length=50, verbose_name="برند خودرو")
    model = models.CharField(max_length=50, verbose_name="مدل خودرو")
    year = models.IntegerField(verbose_name="سال ساخت")
    created_at = models.DateTimeField(verbose_name=("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name=("تاریخ به روزرسانی"), auto_now=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"

    class Meta:
        verbose_name = "خودرو"
        verbose_name_plural = "خودروها"
        unique_together = ('make', 'model', 'year')