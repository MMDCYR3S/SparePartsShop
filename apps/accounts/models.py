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
    مدل کاربر سفارشی که از AbstractUser ارث‌بری می‌کند.
    این مدل تمام فیلدهای استاندارد کاربر جنگو را دارد و ما فیلدهای دلخواه را اضافه می‌کنیم.
    """
    
    phone = models.CharField(max_length=20, verbose_name="شماره تلفن")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس")
    is_admin = models.BooleanField(default=False, verbose_name="ادمین")

    def __str__(self):
        return self.username
