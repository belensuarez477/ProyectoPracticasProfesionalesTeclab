# Script de pruebas automatizadas - Backend API (PowerShell)

$API_URL = "http://localhost:5000"
$TOKEN = ""
$USER_ID = ""
$SERVICIO_ID = ""
$TURNO_ID = ""
$CLIENTE_TOKEN = ""

Write-Host "🧪 Iniciando pruebas de API..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

function Print-Result {
    param($Success, $Message)
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

# 1. Verificar servidor
Write-Host "`n1️⃣  Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $API_URL -Method Get -UseBasicParsing
    Print-Result $true "Servidor corriendo en $API_URL"
} catch {
    Print-Result $false "Servidor NO está corriendo"
    exit 1
}

# 2. Registrar profesional
Write-Host "`n2️⃣  Registrando usuario profesional..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerBody = @{
    email = "test_prof_$timestamp@test.com"
    password = "123456"
    nombre = "Test"
    apellido = "Profesional"
    telefono = "1234567890"
    tipoUsuario = "profesional"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/registro" -Method Post -Body $registerBody -ContentType "application/json"
    if ($registerResponse.exito) {
        $TOKEN = $registerResponse.token
        $USER_ID = $registerResponse.usuario.id
        Print-Result $true "Usuario profesional registrado"
        Write-Host "   Token: $($TOKEN.Substring(0, [Math]::Min(30, $TOKEN.Length)))..." -ForegroundColor Gray
    }
} catch {
    Print-Result $false "Error al registrar usuario"
    Write-Host "   Error: $_" -ForegroundColor Red
}

# 3. Login
Write-Host "`n3️⃣  Probando login..." -ForegroundColor Yellow
$loginBody = @{
    email = "profesional@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    if ($loginResponse.exito) {
        Print-Result $true "Login exitoso"
    }
} catch {
    Print-Result $false "Error en login (puede ser que el usuario no exista)"
}

# 4. Obtener perfil
Write-Host "`n4️⃣  Obteniendo perfil..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

try {
    $perfilResponse = Invoke-RestMethod -Uri "$API_URL/auth/perfil" -Method Get -Headers $headers
    if ($perfilResponse.exito) {
        Print-Result $true "Perfil obtenido correctamente"
    }
} catch {
    Print-Result $false "Error al obtener perfil"
}

# 5. Crear servicio
Write-Host "`n5️⃣  Creando servicio..." -ForegroundColor Yellow
$servicioBody = @{
    nombre = "Corte de Cabello"
    descripcion = "Corte de cabello profesional"
    precio = 250
    duracion = 30
} | ConvertTo-Json

try {
    $servicioResponse = Invoke-RestMethod -Uri "$API_URL/servicios" -Method Post -Body $servicioBody -ContentType "application/json" -Headers $headers
    if ($servicioResponse.exito) {
        $SERVICIO_ID = $servicioResponse.servicio.id
        Print-Result $true "Servicio creado"
        Write-Host "   ID: $SERVICIO_ID" -ForegroundColor Gray
    }
} catch {
    Print-Result $false "Error al crear servicio"
}

# 6. Listar servicios
Write-Host "`n6️⃣  Listando servicios..." -ForegroundColor Yellow
try {
    $serviciosResponse = Invoke-RestMethod -Uri "$API_URL/servicios" -Method Get -Headers $headers
    if ($serviciosResponse.exito) {
        Print-Result $true "Servicios listados correctamente"
    }
} catch {
    Print-Result $false "Error al listar servicios"
}

# 7. Registrar cliente
Write-Host "`n7️⃣  Registrando cliente..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$clienteBody = @{
    email = "test_cliente_$timestamp@test.com"
    password = "123456"
    nombre = "Test"
    apellido = "Cliente"
    telefono = "9876543210"
    tipoUsuario = "cliente"
} | ConvertTo-Json

try {
    $clienteResponse = Invoke-RestMethod -Uri "$API_URL/auth/registro" -Method Post -Body $clienteBody -ContentType "application/json"
    if ($clienteResponse.exito) {
        $CLIENTE_TOKEN = $clienteResponse.token
        Print-Result $true "Cliente registrado"
    }
} catch {
    Print-Result $false "Error al registrar cliente"
}

# 8. Agendar turno
if ($SERVICIO_ID -and $CLIENTE_TOKEN) {
    Write-Host "`n8️⃣  Agendando turno..." -ForegroundColor Yellow
    $clienteHeaders = @{
        "Authorization" = "Bearer $CLIENTE_TOKEN"
    }
    $turnoBody = @{
        profesionalId = $USER_ID
        servicioId = $SERVICIO_ID
        fecha = "2026-02-15"
        hora = "10:00"
        notas = "Prueba automatizada"
    } | ConvertTo-Json

    try {
        $turnoResponse = Invoke-RestMethod -Uri "$API_URL/turnos" -Method Post -Body $turnoBody -ContentType "application/json" -Headers $clienteHeaders
        if ($turnoResponse.exito) {
            $TURNO_ID = $turnoResponse.turno.id
            Print-Result $true "Turno agendado"
            Write-Host "   ID: $TURNO_ID" -ForegroundColor Gray
        }
    } catch {
        Print-Result $false "Error al agendar turno"
    }
}

# 9. Turnos del profesional
Write-Host "`n9️⃣  Consultando turnos del profesional..." -ForegroundColor Yellow
try {
    $turnosProfResponse = Invoke-RestMethod -Uri "$API_URL/turnos/profesional/mis-turnos" -Method Get -Headers $headers
    if ($turnosProfResponse.exito) {
        Print-Result $true "Turnos del profesional obtenidos"
    }
} catch {
    Print-Result $false "Error al obtener turnos del profesional"
}

# 10. Turnos del cliente
Write-Host "`n🔟 Consultando turnos del cliente..." -ForegroundColor Yellow
$clienteHeaders = @{
    "Authorization" = "Bearer $CLIENTE_TOKEN"
}
try {
    $turnosClienteResponse = Invoke-RestMethod -Uri "$API_URL/turnos/cliente/mis-turnos" -Method Get -Headers $clienteHeaders
    if ($turnosClienteResponse.exito) {
        Print-Result $true "Turnos del cliente obtenidos"
    }
} catch {
    Print-Result $false "Error al obtener turnos del cliente"
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✨ Pruebas completadas" -ForegroundColor Green
Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
Write-Host "   - Token profesional: $($TOKEN.Substring(0, [Math]::Min(30, $TOKEN.Length)))..." -ForegroundColor Gray
Write-Host "   - Token cliente: $($CLIENTE_TOKEN.Substring(0, [Math]::Min(30, $CLIENTE_TOKEN.Length)))..." -ForegroundColor Gray
Write-Host "   - Servicio ID: $SERVICIO_ID" -ForegroundColor Gray
Write-Host "   - Turno ID: $TURNO_ID" -ForegroundColor Gray
