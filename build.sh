#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias del frontend y construir
cd frontend
npm install
npm run build
cd ..

# Instalar dependencias del backend
pip install -r requirements.txt
