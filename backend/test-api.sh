#!/bin/bash

# Script de pruebas automatizadas - Backend API
# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000"
TOKEN=""
USER_ID=""
SERVICIO_ID=""
TURNO_ID=""

echo "🧪 Iniciando pruebas de API..."
echo "================================"

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Verificar que el servidor esté corriendo
echo ""
echo "1️⃣  Verificando servidor..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
if [ "$response" -eq 200 ]; then
    print_result 0 "Servidor corriendo en $API_URL"
else
    print_result 1 "Servidor NO está corriendo"
    exit 1
fi

# 2. Registrar usuario profesional
echo ""
echo "2️⃣  Registrando usuario profesional..."
register_response=$(curl -s -X POST $API_URL/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_prof_'$(date +%s)'@test.com",
    "password": "123456",
    "nombre": "Test",
    "apellido": "Profesional",
    "telefono": "1234567890",
    "tipoUsuario": "profesional"
  }')

if echo "$register_response" | grep -q '"exito":true'; then
    TOKEN=$(echo $register_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo $register_response | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_result 0 "Usuario profesional registrado"
    echo "   Token: ${TOKEN:0:30}..."
else
    print_result 1 "Error al registrar usuario"
    echo "   Response: $register_response"
fi

# 3. Login
echo ""
echo "3️⃣  Probando login..."
login_response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesional@test.com",
    "password": "123456"
  }')

if echo "$login_response" | grep -q '"exito":true'; then
    print_result 0 "Login exitoso"
else
    print_result 1 "Error en login (puede ser que el usuario no exista)"
fi

# 4. Obtener perfil
echo ""
echo "4️⃣  Obteniendo perfil..."
perfil_response=$(curl -s -X GET $API_URL/auth/perfil \
  -H "Authorization: Bearer $TOKEN")

if echo "$perfil_response" | grep -q '"exito":true'; then
    print_result 0 "Perfil obtenido correctamente"
else
    print_result 1 "Error al obtener perfil"
fi

# 5. Crear servicio
echo ""
echo "5️⃣  Creando servicio..."
servicio_response=$(curl -s -X POST $API_URL/servicios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Corte de Cabello",
    "descripcion": "Corte de cabello profesional",
    "precio": 250,
    "duracion": 30
  }')

if echo "$servicio_response" | grep -q '"exito":true'; then
    SERVICIO_ID=$(echo $servicio_response | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_result 0 "Servicio creado"
    echo "   ID: $SERVICIO_ID"
else
    print_result 1 "Error al crear servicio"
    echo "   Response: $servicio_response"
fi

# 6. Listar servicios
echo ""
echo "6️⃣  Listando servicios..."
servicios_response=$(curl -s -X GET $API_URL/servicios \
  -H "Authorization: Bearer $TOKEN")

if echo "$servicios_response" | grep -q '"exito":true'; then
    print_result 0 "Servicios listados correctamente"
else
    print_result 1 "Error al listar servicios"
fi

# 7. Registrar cliente
echo ""
echo "7️⃣  Registrando cliente..."
cliente_response=$(curl -s -X POST $API_URL/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_cliente_'$(date +%s)'@test.com",
    "password": "123456",
    "nombre": "Test",
    "apellido": "Cliente",
    "telefono": "9876543210",
    "tipoUsuario": "cliente"
  }')

if echo "$cliente_response" | grep -q '"exito":true'; then
    CLIENTE_TOKEN=$(echo $cliente_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_result 0 "Cliente registrado"
else
    print_result 1 "Error al registrar cliente"
fi

# 8. Agendar turno
if [ -n "$SERVICIO_ID" ] && [ -n "$CLIENTE_TOKEN" ]; then
    echo ""
    echo "8️⃣  Agendando turno..."
    turno_response=$(curl -s -X POST $API_URL/turnos \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $CLIENTE_TOKEN" \
      -d '{
        "profesionalId": "'$USER_ID'",
        "servicioId": "'$SERVICIO_ID'",
        "fecha": "2026-02-15",
        "hora": "10:00",
        "notas": "Prueba automatizada"
      }')

    if echo "$turno_response" | grep -q '"exito":true'; then
        TURNO_ID=$(echo $turno_response | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_result 0 "Turno agendado"
        echo "   ID: $TURNO_ID"
    else
        print_result 1 "Error al agendar turno"
        echo "   Response: $turno_response"
    fi
fi

# 9. Ver turnos del profesional
echo ""
echo "9️⃣  Consultando turnos del profesional..."
turnos_prof_response=$(curl -s -X GET "$API_URL/turnos/profesional/mis-turnos" \
  -H "Authorization: Bearer $TOKEN")

if echo "$turnos_prof_response" | grep -q '"exito":true'; then
    print_result 0 "Turnos del profesional obtenidos"
else
    print_result 1 "Error al obtener turnos del profesional"
fi

# 10. Ver turnos del cliente
echo ""
echo "🔟 Consultando turnos del cliente..."
turnos_cliente_response=$(curl -s -X GET "$API_URL/turnos/cliente/mis-turnos" \
  -H "Authorization: Bearer $CLIENTE_TOKEN")

if echo "$turnos_cliente_response" | grep -q '"exito":true'; then
    print_result 0 "Turnos del cliente obtenidos"
else
    print_result 1 "Error al obtener turnos del cliente"
fi

echo ""
echo "================================"
echo -e "${GREEN}✨ Pruebas completadas${NC}"
echo ""
echo "📊 Resumen:"
echo "   - Token profesional: ${TOKEN:0:30}..."
echo "   - Token cliente: ${CLIENTE_TOKEN:0:30}..."
echo "   - Servicio ID: $SERVICIO_ID"
echo "   - Turno ID: $TURNO_ID"
