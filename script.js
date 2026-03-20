// ==============================================
// 🎯 CALCULADORA DE COMISIONES - SOLO PRODUCER
// ==============================================

let TASA_DOLAR_COP = 3800;

function doGet(e) {
  const params = e ? e.parameter : {};
  const rol = params.rol || '';
  
  if (rol === 'producer') {
    return crearPaginaProducer();
  }
  
  if (rol === 'coordinador') {
    return crearPaginaCoordinador();
  }
  
  if (rol === 'lider') {
    return crearPaginaLider();
  }
  
  return crearMenuPrincipal();
}

function obtenerTasaDolarCOP() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("tasa_usd_cop");
    
    if (cached != null) {
      return parseFloat(cached);
    }
    
    const fuentes = [
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://api.frankfurter.app/latest?from=USD&to=COP',
      'https://api.exchangerate.host/latest?base=USD&symbols=COP'
    ];
    
    for (let fuente of fuentes) {
      try {
        const respuesta = UrlFetchApp.fetch(fuente, {
          muteHttpExceptions: true,
          timeout: 5
        });
        
        if (respuesta.getResponseCode() === 200) {
          const datos = JSON.parse(respuesta.getContentText());
          let tasa = null;
          
          if (datos.rates && datos.rates.COP) {
            tasa = datos.rates.COP;
          }
          
          if (tasa && tasa > 0) {
            cache.put("tasa_usd_cop", tasa.toString(), 1800);
            return tasa;
          }
        }
      } catch (e) {
        Logger.log('⚠️ Error con fuente: ' + e.message);
      }
    }
    
    return 3800;
    
  } catch (error) {
    return 3800;
  }
}

function calcularComisiones(consumoUSD, tasaCOP) {
  const galones = consumoUSD / 4;
  const rebates = galones * 0.33;
  const cliente = rebates * 0.30;
  const finoServices = rebates - cliente;
  const teamComercial = finoServices * 0.30;
  const producerCOP = (teamComercial / 100) * 60000;
  const coordinadorCOP = producerCOP / 2;
  const liderCOP = coordinadorCOP / 2;
  
  return {
    galones: galones,
    rebatesCOP: rebates * tasaCOP,
    clienteCOP: cliente * tasaCOP,
    finoServicesCOP: finoServices * tasaCOP,
    teamComercialCOP: teamComercial * tasaCOP,
    producerCOP: producerCOP,
    coordinadorCOP: coordinadorCOP,
    liderCOP: liderCOP
  };
}

function crearMenuPrincipal() {
  const url = ScriptApp.getService().getUrl();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }
      
      body {
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                    url('https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      
      .container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 40px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
      }
      
      .logo {
        font-size: 50px;
        margin-bottom: 10px;
      }
      
      h1 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-weight: 700;
      }
      
      .subtitle {
        color: #7f8c8d;
        margin-bottom: 30px;
        font-size: 16px;
      }
      
      .role-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .role-card {
        display: block;
        padding: 25px;
        border-radius: 15px;
        text-decoration: none;
        color: white;
        font-weight: 600;
        font-size: 18px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: none;
      }
      
      .role-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }
      
      .role-card:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: 0.5s;
      }
      
      .role-card:hover:before {
        left: 100%;
      }
      
      .role-card.producer {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
      }
      
      .role-card.coordinador {
        background: linear-gradient(135deg, #3498db, #2980b9);
      }
      
      .role-card.lider {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
      }
      
      .role-icon {
        font-size: 30px;
        margin-bottom: 10px;
      }
      
      .role-desc {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 5px;
      }
      
      .lock-icon {
        font-size: 12px;
        margin-left: 5px;
      }
      
      .footer {
        margin-top: 30px;
        color: #95a5a6;
        font-size: 14px;
      }
      
      .update-badge {
        background: #2c3e50;
        color: white;
        padding: 5px 10px;
        border-radius: 50px;
        font-size: 12px;
        display: inline-block;
        margin-bottom: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="update-badge">🔄 ACTUALIZADO AUTOMÁTICAMENTE</div>
      <div class="logo">💰</div>
      <h1>CALCULADORA DE COMISIONES</h1>
      
      <p class="subtitle">Selecciona tu rol para acceder</p>
      
      <div class="role-grid">
        <div onclick="window.location.href='${url}?rol=producer'" class="role-card producer">
          <div class="role-icon">👤</div>
          <div>PRODUCER</div>
          <div class="role-desc">Acceso directo</div>
        </div>
        
        <div onclick="solicitarContrasena('coordinador')" class="role-card coordinador">
          <div class="role-icon">👥</div>
          <div>COORDINADOR <span class="lock-icon">🔒</span></div>
          <div class="role-desc">Acceso restringido</div>
        </div>
        
        <div onclick="solicitarContrasena('lider')" class="role-card lider">
          <div class="role-icon">🏢</div>
          <div>LÍDER DE SEDE <span class="lock-icon">🔒</span></div>
          <div class="role-desc">Acceso restringido</div>
        </div>
      </div>
      
      <div class="footer">
        © 2024 Sistema de Comisiones
      </div>
    </div>
    
    <script>
    function solicitarContrasena(rol) {
      const contrasena = prompt('Ingresa la contraseña para ' + rol.toUpperCase() + ':');
      
      if (contrasena) {
        if (rol === 'coordinador' && contrasena === 'coordinador123') {
          window.location.href = '${url}?rol=coordinador';
        } 
        else if (rol === 'lider' && contrasena === 'lider456') {
          window.location.href = '${url}?rol=lider';
        }
        else {
          alert('Contraseña incorrecta');
        }
      }
    }
    </script>
  </body>
  </html>`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Calculadora de Comisiones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function crearPaginaProducer() {
  const url = ScriptApp.getService().getUrl();
  const tasaCOP = obtenerTasaDolarCOP();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }
      
      body {
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                    url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .calculator-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 30px;
        text-align: center;
        position: relative;
      }
      
      .back-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 15px;
        border-radius: 50px;
        text-decoration: none;
        font-size: 14px;
        transition: 0.3s;
      }
      
      .back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .content {
        padding: 30px;
      }
      
      .input-section {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .input-label {
        display: block;
        margin-bottom: 20px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .input-wrapper {
        position: relative;
        max-width: 300px;
        margin: 0 auto 25px;
      }
      
      .currency-symbol {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        color: #27ae60;
        font-size: 20px;
      }
      
      input[type="number"] {
        width: 100%;
        padding: 15px 20px 15px 45px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        transition: 0.3s;
        background: #f8f9fa;
      }
      
      input[type="number"]:focus {
        border-color: #27ae60;
        background: white;
        outline: none;
      }
      
      .calculate-btn {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
        max-width: 300px;
      }
      
      .calculate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
      }
      
      .result {
        background: linear-gradient(135deg, #f8fff9, #e8f6ef);
        border-radius: 15px;
        padding: 25px;
        margin-top: 20px;
        border: 2px solid #27ae60;
        text-align: center;
        display: none;
      }
      
      .result-label {
        color: #27ae60;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      
      .result-value {
        font-size: 42px;
        font-weight: 700;
        color: #27ae60;
        margin: 10px 0;
        line-height: 1.2;
      }
      
      .result-currency {
        color: #666;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="calculator-container">
      <div class="header">
        <a href="${url}" class="back-btn">←</a>
        <h1>PRODUCER</h1>
      </div>
      
      <div class="content">
        <div class="input-section">
          <div class="input-label">CONSUMO (USD)</div>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" id="valorConsumo" placeholder="0.00" step="0.01" min="0" autofocus>
          </div>
          <button class="calculate-btn" onclick="calcular(${tasaCOP})">CALCULAR</button>
        </div>
        
        <div class="result" id="result">
          <div class="result-label">COMISIÓN</div>
          <div class="result-value" id="producerValue">$0</div>
          <div class="result-currency">PESOS COLOMBIANOS</div>
        </div>
      </div>
    </div>
    
    <script>
      function calcular(tasaCOP) {
        const valorInput = document.getElementById("valorConsumo").value;
        
        if (!valorInput || valorInput <= 0) {
          alert("Ingresa un valor válido");
          return;
        }
        
        const consumo = parseFloat(valorInput);
        
        const galones = consumo / 4;
        const rebates = galones * 0.33;
        const cliente = rebates * 0.30;
        const finoServices = rebates - cliente;
        const teamComercial = finoServices * 0.30;
        const producerCOP = (teamComercial / 100) * 60000;
        
        // 🔹 MODIFICADO: Ahora muestra 2 decimales
        document.getElementById("producerValue").textContent = "$" + producerCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById("result").style.display = "block";
      }
      
      document.getElementById("valorConsumo").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          calcular(${tasaCOP});
        }
      });
    </script>
  </body>
  </html>`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle("Producer")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function crearPaginaCoordinador() {
  const url = ScriptApp.getService().getUrl();
  const tasaCOP = obtenerTasaDolarCOP();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }
      
      body {
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                    url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .calculator-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        width: 100%;
        max-width: 600px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 30px;
        text-align: center;
        position: relative;
      }
      
      .back-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 15px;
        border-radius: 50px;
        text-decoration: none;
        font-size: 14px;
        transition: 0.3s;
      }
      
      .back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .content {
        padding: 30px;
      }
      
      .input-section {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .input-label {
        display: block;
        margin-bottom: 20px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .input-wrapper {
        position: relative;
        max-width: 300px;
        margin: 0 auto 25px;
      }
      
      .currency-symbol {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        color: #3498db;
        font-size: 20px;
      }
      
      input[type="number"] {
        width: 100%;
        padding: 15px 20px 15px 45px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        transition: 0.3s;
        background: #f8f9fa;
      }
      
      input[type="number"]:focus {
        border-color: #3498db;
        background: white;
        outline: none;
      }
      
      .calculate-btn {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
        max-width: 300px;
      }
      
      .calculate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
      }
      
      .results-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-top: 20px;
        display: none;
      }
      
      .result-card {
        padding: 20px;
        border-radius: 12px;
        text-align: center;
      }
      
      .result-card.producer {
        background: linear-gradient(135deg, #e8f6ef, #d4efdf);
        border-top: 4px solid #27ae60;
      }
      
      .result-card.coordinador {
        background: linear-gradient(135deg, #ebf5fb, #d6eaf8);
        border-top: 4px solid #3498db;
      }
      
      .result-label {
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .result-value {
        font-size: 28px;
        font-weight: 700;
        margin: 8px 0;
      }
      
      .producer .result-value {
        color: #27ae60;
      }
      
      .coordinador .result-value {
        color: #3498db;
      }
      
      .result-currency {
        color: #666;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="calculator-container">
      <div class="header">
        <a href="${url}" class="back-btn">←</a>
        <h1>COORDINADOR</h1>
      </div>
      
      <div class="content">
        <div class="input-section">
          <div class="input-label">CONSUMO (USD)</div>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" id="valorConsumo" placeholder="0.00" step="0.01" min="0" autofocus>
          </div>
          <button class="calculate-btn" onclick="calcular(${tasaCOP})">CALCULAR</button>
        </div>
        
        <div class="results-grid" id="resultsGrid">
          <div class="result-card producer">
            <div class="result-label">PRODUCER</div>
            <div class="result-value" id="producerValue">$0</div>
            <div class="result-currency">COP</div>
          </div>
          
          <div class="result-card coordinador">
            <div class="result-label">COORDINADOR</div>
            <div class="result-value" id="coordinadorValue">$0</div>
            <div class="result-currency">COP</div>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      function calcular(tasaCOP) {
        const valorInput = document.getElementById('valorConsumo').value;
        
        if (!valorInput || valorInput <= 0) {
          alert('Ingresa un valor válido');
          return;
        }
        
        const consumo = parseFloat(valorInput);
        
        const galones = consumo / 4;
        const rebates = galones * 0.33;
        const cliente = rebates * 0.30;
        const finoServices = rebates - cliente;
        const teamComercial = finoServices * 0.30;
        const producerCOP = (teamComercial / 100) * 60000;
        const coordinadorCOP = producerCOP / 2;
        
        // 🔹 MODIFICADO: Ahora muestra 2 decimales
        document.getElementById('producerValue').textContent = "$" + producerCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('coordinadorValue').textContent = "$" + coordinadorCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        document.getElementById('resultsGrid').style.display = 'grid';
      }
      
      document.getElementById('valorConsumo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          calcular(${tasaCOP});
        }
      });
    </script>
  </body>
  </html>`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle("Coordinador")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function crearPaginaLider() {
  const url = ScriptApp.getService().getUrl();
  const tasaCOP = obtenerTasaDolarCOP();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }
      
      body {
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                    url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .calculator-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        width: 100%;
        max-width: 700px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 30px;
        text-align: center;
        position: relative;
      }
      
      .back-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 15px;
        border-radius: 50px;
        text-decoration: none;
        font-size: 14px;
        transition: 0.3s;
      }
      
      .back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .content {
        padding: 30px;
      }
      
      .input-section {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .input-label {
        display: block;
        margin-bottom: 20px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .input-wrapper {
        position: relative;
        max-width: 300px;
        margin: 0 auto 25px;
      }
      
      .currency-symbol {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        color: #e74c3c;
        font-size: 20px;
      }
      
      input[type="number"] {
        width: 100%;
        padding: 15px 20px 15px 45px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        transition: 0.3s;
        background: #f8f9fa;
      }
      
      input[type="number"]:focus {
        border-color: #e74c3c;
        background: white;
        outline: none;
      }
      
      .calculate-btn {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
        max-width: 300px;
      }
      
      .calculate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
      }
      
      .results-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-top: 20px;
        display: none;
      }
      
      .result-card {
        padding: 20px;
        border-radius: 12px;
        text-align: center;
      }
      
      .result-card.producer {
        background: linear-gradient(135deg, #e8f6ef, #d4efdf);
        border-top: 4px solid #27ae60;
      }
      
      .result-card.coordinador {
        background: linear-gradient(135deg, #ebf5fb, #d6eaf8);
        border-top: 4px solid #3498db;
      }
      
      .result-card.lider {
        background: linear-gradient(135deg, #fdeaea, #fadbd8);
        border-top: 4px solid #e74c3c;
      }
      
      .result-label {
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .result-value {
        font-size: 24px;
        font-weight: 700;
        margin: 8px 0;
      }
      
      .producer .result-value {
        color: #27ae60;
      }
      
      .coordinador .result-value {
        color: #3498db;
      }
      
      .lider .result-value {
        color: #e74c3c;
      }
      
      .result-currency {
        color: #666;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="calculator-container">
      <div class="header">
        <a href="${url}" class="back-btn">←</a>
        <h1>LÍDER DE SEDE</h1>
      </div>
      
      <div class="content">
        <div class="input-section">
          <div class="input-label">CONSUMO (USD)</div>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" id="valorConsumo" placeholder="0.00" step="0.01" min="0" autofocus>
          </div>
          <button class="calculate-btn" onclick="calcular(${tasaCOP})">CALCULAR</button>
        </div>
        
        <div class="results-grid" id="resultsGrid">
          <div class="result-card producer">
            <div class="result-label">PRODUCER</div>
            <div class="result-value" id="producerValue">$0</div>
            <div class="result-currency">COP</div>
          </div>
          
          <div class="result-card coordinador">
            <div class="result-label">COORDINADOR</div>
            <div class="result-value" id="coordinadorValue">$0</div>
            <div class="result-currency">COP</div>
          </div>
          
          <div class="result-card lider">
            <div class="result-label">LÍDER</div>
            <div class="result-value" id="liderValue">$0</div>
            <div class="result-currency">COP</div>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      function calcular(tasaCOP) {
        const valorInput = document.getElementById('valorConsumo').value;
        
        if (!valorInput || valorInput <= 0) {
          alert('Ingresa un valor válido');
          return;
        }
        
        const consumo = parseFloat(valorInput);
        
        const galones = consumo / 4;
        const rebates = galones * 0.33;
        const cliente = rebates * 0.30;
        const finoServices = rebates - cliente;
        const teamComercial = finoServices * 0.30;
        const producerCOP = (teamComercial / 100) * 60000;
        const coordinadorCOP = producerCOP / 2;
        const liderCOP = coordinadorCOP / 2;
        
        // 🔹 MODIFICADO: Ahora muestra 2 decimales
        document.getElementById('producerValue').textContent = "$" + producerCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('coordinadorValue').textContent = "$" + coordinadorCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('liderValue').textContent = "$" + liderCOP.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        document.getElementById('resultsGrid').style.display = 'grid';
      }
      
      document.getElementById('valorConsumo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          calcular(${tasaCOP});
        }
      });
    </script>
  </body>
  </html>`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle("Líder")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function desplegarAplicacion() {
  const url = ScriptApp.getService().getUrl();
  Logger.log('✅ App: ' + url);
  return url;
}
