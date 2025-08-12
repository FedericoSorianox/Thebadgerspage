#!/bin/bash

echo "Testing the API endpoints..."

# Test 1: Verificar si el endpoint de torneos permite lectura sin autenticación
echo "🔍 Probando GET /api/torneo/torneos/ (sin autenticación)..."
curl -s -w "Status: %{http_code}\n" \
  -H "Accept: application/json" \
  https://thebadgerspage.onrender.com/api/torneo/torneos/

echo -e "\n"

# Test 2: Verificar endpoint de autenticación
echo "🔍 Probando POST /api/auth/login/ (con credenciales de prueba)..."
curl -s -w "Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"wrongpass"}' \
  https://thebadgerspage.onrender.com/api/auth/login/

echo -e "\n"

# Test 3: Verificar endpoint de estado de auth sin credenciales
echo "🔍 Probando GET /api/auth/status/ (sin autenticación)..."
curl -s -w "Status: %{http_code}\n" \
  -H "Accept: application/json" \
  https://thebadgerspage.onrender.com/api/auth/status/

echo -e "\n"

echo "✅ Tests completados."
