from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# ========== Contact ========== #
class Contact(models.Model):
    """ تماس با ما """

    full_name = models.CharField(verbose_name=("نام و نام خانوادگی"), max_length=100)
    email = models.EmailField(verbose_name=("ایمیل"), max_length=100)
    subject = models.CharField(max_length=100, verbose_name=("عنوان"))
    message = models.TextField(verbose_name=("پیام"))
    created_at = models.DateTimeField(verbose_name=("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name=("تاریخ بزورسانی"), auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.email}"
    
    class Meta: 
        verbose_name = "تماس با ما"
        verbose_name_plural = "تماس با ما"
        ordering = ['-created_at']

# ========== Banner ========== # 
class Banner(models.Model):
    """ بنر صفحه اصلی وبسایت """
    
    user = models.ForeignKey(User, verbose_name=("کاربر"), on_delete=models.CASCADE)
    image = models.ImageField(verbose_name=("تصویر"), upload_to="banners/")
    order = models.IntegerField(verbose_name=("سفارش"), default=0)
    created_at = models.DateTimeField(verbose_name=("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name=("تاریخ بروزرسانی"), auto_now=True)
    
    def __str__(self):
        return f"{self.image.tell} - {self.created_at.date}"
    
    class Meta: 
        verbose_name = "بنر"
        verbose_name_plural = "بنرها"
