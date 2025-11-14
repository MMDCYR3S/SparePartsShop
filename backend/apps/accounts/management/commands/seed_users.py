from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import random

from apps.accounts.models import User, Profile, Address


fake = Faker("fa_IR")


class Command(BaseCommand):
    help = "📦 تولید داده تستی داینامیک برای کاربران، پروفایل و آدرس‌ها"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="تعداد کاربران تستی که باید ساخته شوند (پیش‌فرض: 10)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]
        created_users = []
        password = "testpass123"

        for i in range(count):
            username = f"user_{i+1}"
            email = f"{username}@example.com"

            # جلوگیری از تکرار کاربران قبلی
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "is_active": True,
                    "is_staff": False,
                    "is_superuser": False,
                },
            )

            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"👤 کاربر جدید ساخته شد: {username}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ کاربر {username} از قبل وجود دارد."))

            # ====== آدرس ======
            address, _ = Address.objects.get_or_create(
                user=user,
                defaults={
                    "province": fake.state(),            # نام استان (فارسی یا عمومی)
                    "city": fake.city(),                 # نام شهر
                    "street": fake.street_address(),     # آدرس خیابان (نیمه‌واقعی)
                    "postal_code": fake.postcode(),      # کدپستی معتبر
                    "detail": fake.address().replace("\n", " "),  # جزئیات آدرس
                },
            )

            # ====== پروفایل ======
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                    "phone": f"09{random.randint(100000000, 999999999)}",
                    "landline": fake.phone_number(),
                    "address": address,
                },
            )

            created_users.append(user.username)

        # ====== گزارش نهایی ======
        self.stdout.write(self.style.SUCCESS("\n✅ ایجاد داده تستی با موفقیت انجام شد!"))
        self.stdout.write(f"🔹 کاربران ساخته‌شده/بازیابی‌شده: {', '.join(created_users)}")
        self.stdout.write(self.style.HTTP_INFO(f"🔹 رمز عبور پیش‌فرض همه‌ی کاربران: {password}"))
