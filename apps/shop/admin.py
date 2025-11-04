from django.contrib import admin

from .models import Category, Car, Product, ProductImage

admin.site.register(Category)
admin.site.register(Car)
admin.site.register(Product)
admin.site.register(ProductImage)

