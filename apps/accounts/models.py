from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _


# ========== User Manager ========== #
class UserManager(BaseUserManager):
    """Summary:
    Custom user model manager where email is the unique
    identifiers for authentication instead of usernames.
    """

    def create_user(self, username, password, **extra_fields):
        """Description:
        Create and save a user with username and password and
        extra fields.
        """
        if not username:
            raise ValueError(_("The email must be set!"))
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, password, **extra_fields):
        """Description:
        Create and save a superuser with email and password and
        extra fields.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") != True:
            raise ValueError(_("Superuser must have staff permission!"))

        if extra_fields.get("is_superuser") != True:
            raise ValueError(_("Superuser must have superuser permission!"))

        return self.create_user(username, password, **extra_fields)


# ======== User Model ======== #
class User(AbstractBaseUser, PermissionsMixin):
    """This is a User Model where It gets email as username."""

    username = models.CharField(max_length=200, unique=True)
    email = models.EmailField(max_length=254)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    objects = UserManager()

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email

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
