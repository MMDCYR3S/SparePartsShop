from django.db import models

# ========= Car Model ========= #
class Car(models.Model):
    """
    مدل برای ذخیره اطلاعات خودروها جهت اتصال به محصولات
    """
    make = models.CharField(max_length=50, verbose_name="برند خودرو")
    model = models.CharField(max_length=50, verbose_name="مدل خودرو")
    year = models.IntegerField(verbose_name="سال ساخت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ به روزرسانی")

    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"

    class Meta:
        verbose_name = "خودرو"
        verbose_name_plural = "خودروها"
        unique_together = ('make', 'model', 'year')