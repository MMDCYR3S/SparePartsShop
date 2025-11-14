from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

# ========= Create User Profile ========= #
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    هر بار که یک کاربر جدید ساخته شد، یک پروفایل خالی برای او نیز بساز.
    """
    if created:
        Profile.objects.create(user=instance)

# ========= Save User Profile ========= #
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    هر بار که کاربر ذخیره شد، پروفایل او را نیز ذخیره کن.
    """
    instance.profile.save()
