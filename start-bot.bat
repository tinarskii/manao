@echo off
bun x @tailwindcss/cli -i ./server/public/css/tailwind.css -o ./server/public/css/dist/tailwind.css
bun start