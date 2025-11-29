# --- مرحله ۱: بیلد کردن ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
# نصب پکیج‌ها
RUN npm ci --silent
COPY . .
# ساخت پوشه dist
RUN npm run build

# --- مرحله ۲: سرو کردن با Nginx ---
FROM nginx:alpine

# ۱. کپی کردن فایل‌های بیلد شده به پوشه استاندارد Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# ۲. (مهم) کپی کردن تنظیمات اختصاصی Nginx که ساختیم
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
