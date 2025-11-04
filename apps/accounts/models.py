from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

# ======= User Manager Model ======= #
class UserManager(BaseUserManager):
    """
     مدل مدیر سفیرشی که از BaseUserManager ارث‌بری می‌کند.
     اگر شما یک مدل کاربر سفارشی سازید، باید آن را با این مدل جایگزین کنید.
     """
    def create_user(self, username, email, password=None, **extra_fields):
        """
        ایجاد کاربر جدید با ایمیل و رمز عبور.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        
        user.save()
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        ایجاد کاربر مدیر سیستم جدید با ایمیل و رمز عبور.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(username, email, password, **extra_fields)


# ======= User Model ======= #
class User(AbstractUser):
    """
    مدل کاربر سفارشی که فقط مسئول احراز هویت است.
    """
    is_admin = models.BooleanField(default=False, verbose_name="ادمین")

    objects = UserManager()

    def __str__(self):
        return self.username

# ======= Address Model ======= #
class Address(models.Model):
    """ مدل آدرس برای کاربران """
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="کاربر")
    province = models.CharField(max_length=50, verbose_name="استان")
    city = models.CharField(max_length=50, verbose_name="شهر")
    street = models.CharField(max_length=50, verbose_name="خیابان")
    postal_code = models.CharField(max_length=10, verbose_name="کد پستی")
    detail = models.TextField(verbose_name="آدرس دقیق")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ به روزرسانی")
    

# ======= Profile Model ======= #
class Profile(models.Model):
    """
    مدل برای ذخیره اطلاعات پروفایل کاربر
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="کاربر")
    first_name = models.CharField(max_length=50, verbose_name="نام")
    last_name = models.CharField(max_length=50, verbose_name="نام خانوادگی")
    phone = models.CharField(max_length=20, verbose_name="شماره تلفن همراه")
    landline = models.CharField(max_length=20, blank=True, null=True, verbose_name="تلفن ثابت")
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="آدرس")
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True, verbose_name="عکس پروفایل")

    def __str__(self):
        return f"پروفایل {self.user.username}"

    class Meta:
        verbose_name = "پروفایل"
        verbose_name_plural = "پروفایل‌ها"
