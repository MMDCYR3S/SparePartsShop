from django.core.management.base import BaseCommand
from faker import Faker
from decimal import Decimal
import random
from slugify import slugify

from apps.shop.models import Product, ProductImage, Category, Car

fake = Faker("fa_IR")

BRANDS = ["Bosch", "Valeo", "Mahle", "Mann", "NGK", "AISIN", "Sofima", "Sachs"]
COUNTRIES = ["آلمان", "ژاپن", "ایران", "چین", "فرانسه", "کُره جنوبی", "ایتالیا"]

SAMPLE_IMAGES = [
    "products/engine_oil.jpg",
    "products/brake_pad.jpg",
    "products/oil_filter.jpg",
    "products/spark_plug.jpg",
    "products/air_filter.jpg",
    "products/battery.jpg",
]


class Command(BaseCommand):
    help = "🛠 ایجاد داده تستی برای محصولات و تصاویر آن‌ها"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="تعداد محصولات تستی برای ایجاد (پیش‌فرض: 20)",
        )
        parser.add_argument(
            "--images-per-product",
            type=int,
            default=2,
            help="تعداد عکس برای هر محصول (پیش‌فرض: 2)",
        )

    def handle(self, *args, **options):
        count = options["count"]
        images_per_product = options["images_per_product"]

        categories = list(Category.objects.all())
        cars = list(Car.objects.all())

        if not categories:
            self.stdout.write(self.style.ERROR("⚠️ هیچ Category در سیستم وجود ندارد."))
            return
        if not cars:
            self.stdout.write(self.style.ERROR("⚠️ هیچ Car در سیستم وجود ندارد."))
            return

        created = 0

        for _ in range(count):
            name = f"{fake.word()} {random.choice(['فیلتر', 'لنت', 'روغن', 'واشر', 'دیسک', 'کوئل', 'تسمه'])}"
            category = random.choice(categories)
            brand = random.choice(BRANDS)
            car_selection = random.sample(cars, k=min(len(cars), random.randint(1, 3)))

            product, created_flag = Product.objects.get_or_create(
                part_code=f"P-{random.randint(10000, 99999)}",
                defaults={
                    "name": name,
                    "slug": slugify(name),
                    "description": fake.paragraph(nb_sentences=2),
                    "brand": brand,
                    "country_of_origin": random.choice(COUNTRIES),
                    "warranty": random.choice(["6 ماه", "12 ماه", "18 ماه", None]),
                    "price": Decimal(random.randint(200_000, 4_000_000)),
                    "stock_quantity": random.randint(0, 200),
                    "package_quantity": random.choice([1, 5, 10]),
                    "allow_individual_sale": random.choice([True, False]),
                    "category": category,
                    "is_active": True,
                },
            )

            if not created_flag:
                continue  # از تکرار جلوگیری می‌کنه

            product.compatible_cars.set(car_selection)
            product.save()
            created += 1

            # ساخت تصاویر تستی
            chosen_images = random.sample(SAMPLE_IMAGES, k=images_per_product)
            for idx, image_path in enumerate(chosen_images):
                ProductImage.objects.create(
                    product=product,
                    image=image_path,
                    is_main=(idx == 0)
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ {product.name} ساخته شد ({brand}) ← دسته: {category.name}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 {created} محصول تستی ساخته شد ✅")
        )
