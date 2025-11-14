from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
import random
from apps.shop.models import Car

fake = Faker("fa_IR")
User = get_user_model()

# چند برند و مدل معروف برای تست
CAR_DATA = {
    "Peugeot": ["206", "207", "405", "Pars", "301"],
    "Renault": ["Tondar 90", "Sandero", "Duster", "Symbol"],
    "Kia": ["Cerato", "Sportage", "Rio", "Sorento"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe"],
    "Toyota": ["Yaris", "Corolla", "Camry", "RAV4"],
    "BMW": ["320i", "520i", "X3", "X5"],
    "Benz": ["C200", "E200", "GLC", "S500"],
    "Saipa": ["Pride", "Tiba", "Saina", "Shahin"],
}


class Command(BaseCommand):
    help = "🚗 تولید خودروهای تستی تصادفی برای کاربران"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="تعداد کل خودروهایی که ساخته می‌شوند (پیش‌فرض: 20)",
        )
        parser.add_argument(
            "--cars-per-user",
            type=int,
            default=2,
            help="میانگین تعداد خودرو به ازای هر کاربر (پیش‌فرض: 2)",
        )

    def handle(self, *args, **options):
        count = options["count"]
        cars_per_user = options["cars_per_user"]
        users = list(User.objects.all())

        if not users:
            self.stdout.write(self.style.ERROR("⚠️ هیچ کاربری در سیستم وجود ندارد."))
            return

        created = 0
        for user in users:
            n = random.randint(1, cars_per_user)
            for _ in range(n):
                make = random.choice(list(CAR_DATA.keys()))
                model = random.choice(CAR_DATA[make])
                year = random.randint(1390, 1403)

                car, created_flag = Car.objects.get_or_create(
                    user=user,
                    make=make,
                    model=model,
                    year=year,
                )

                if created_flag:
                    created += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✅ خودرو جدید برای {user.username}: {make} {model} ({year})"
                        )
                    )

                if created >= count:
                    break
            if created >= count:
                break

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 مجموعاً {created} خودرو تستی ایجاد شد.")
        )
