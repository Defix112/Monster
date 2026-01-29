#!/bin/bash
# Bash скрипт для создания ZIP архива
# Запустите: chmod +x create-zip.sh && ./create-zip.sh

ZIP_NAME="Calculator-PWA.zip"

# Удалить старый архив если существует
if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
fi

# Создать ZIP архив
zip -r "$ZIP_NAME" \
    index.html \
    style.css \
    script.js \
    manifest.json \
    service-worker.js \
    README.md \
    create-icons.html \
    generate-icons.js

echo "Архив создан: $ZIP_NAME"
echo "Файлы в архиве:"
unzip -l "$ZIP_NAME" | tail -n +4 | head -n -2



