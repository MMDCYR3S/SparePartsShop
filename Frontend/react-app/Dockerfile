FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# این دستور پوشه dist را می‌سازد
RUN npm run build

# --- مرحله دوم: سرو کردن با Nginx ---
FROM nginx:alpine
# کپی کردن فایل‌های ساخته شده در مرحله قبل به پوشه Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# باز کردن پورت 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]