#!/usr/bin/env node

/**
 * Script para testar funcionalidades PWA localmente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Testando PWA - DashiTask\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✅' : '❌'} ${description}`, exists ? 'green' : 'red');
  return exists;
}

function checkManifest() {
  log('\n📱 Verificando Web App Manifest:', 'bold');
  
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  if (!checkFile(manifestPath, 'manifest.json existe')) {
    return false;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    let valid = true;

    requiredFields.forEach(field => {
      const hasField = manifest[field] !== undefined;
      log(`${hasField ? '✅' : '❌'} Campo '${field}' presente`, hasField ? 'green' : 'red');
      if (!hasField) valid = false;
    });

    // Verificar ícones
    if (manifest.icons && Array.isArray(manifest.icons)) {
      const hasRequiredSizes = manifest.icons.some(icon => 
        icon.sizes === '192x192' || icon.sizes === '512x512'
      );
      log(`${hasRequiredSizes ? '✅' : '❌'} Ícones com tamanhos adequados (192x192, 512x512)`, 
          hasRequiredSizes ? 'green' : 'red');
      if (!hasRequiredSizes) valid = false;
    }

    return valid;
  } catch (error) {
    log(`❌ Erro ao ler manifest.json: ${error.message}`, 'red');
    return false;
  }
}

function checkServiceWorker() {
  log('\n⚙️ Verificando Service Worker:', 'bold');
  
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  if (!checkFile(swPath, 'sw.js existe')) {
    return false;
  }

  try {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    const requiredFeatures = [
      { name: 'Event listeners (install, activate, fetch)', pattern: /addEventListener\s*\(\s*['"`](install|activate|fetch)['"`]/ },
      { name: 'Cache API usage', pattern: /caches\.(open|match|delete)/ },
      { name: 'Fetch interception', pattern: /event\.respondWith/ },
      { name: 'Cache strategies', pattern: /(networkFirst|cacheFirst|staleWhileRevalidate)/ }
    ];

    let valid = true;
    requiredFeatures.forEach(feature => {
      const hasFeature = feature.pattern.test(swContent);
      log(`${hasFeature ? '✅' : '❌'} ${feature.name}`, hasFeature ? 'green' : 'red');
      if (!hasFeature) valid = false;
    });

    return valid;
  } catch (error) {
    log(`❌ Erro ao ler sw.js: ${error.message}`, 'red');
    return false;
  }
}

function checkIcons() {
  log('\n🎨 Verificando Ícones PWA:', 'bold');
  
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  const requiredIcons = [
    'icon-16.png',
    'icon-32.png', 
    'icon-192.png',
    'icon-512.png'
  ];

  let allIconsExist = true;
  requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    const exists = checkFile(iconPath, icon);
    if (!exists) allIconsExist = false;
  });

  return allIconsExist;
}

function checkVersionSystem() {
  log('\n🔄 Verificando Sistema de Versionamento:', 'bold');
  
  const versionCheckPath = path.join(process.cwd(), 'src', 'lib', 'version-check.ts');
  const updateNotificationPath = path.join(process.cwd(), 'src', 'components', 'UpdateNotification.tsx');
  
  let valid = true;
  if (!checkFile(versionCheckPath, 'version-check.ts existe')) valid = false;
  if (!checkFile(updateNotificationPath, 'UpdateNotification.tsx existe')) valid = false;

  return valid;
}

function checkBuildConfiguration() {
  log('\n🔧 Verificando Configuração de Build:', 'bold');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  
  let valid = true;

  // Verificar package.json
  if (checkFile(packageJsonPath, 'package.json existe')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasScripts = packageJson.scripts && packageJson.scripts.build;
      log(`${hasScripts ? '✅' : '❌'} Script de build configurado`, hasScripts ? 'green' : 'red');
      if (!hasScripts) valid = false;
    } catch (error) {
      log(`❌ Erro ao ler package.json: ${error.message}`, 'red');
      valid = false;
    }
  } else {
    valid = false;
  }

  // Verificar vite.config.ts
  if (checkFile(viteConfigPath, 'vite.config.ts existe')) {
    try {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      const hasBaseConfig = /base:\s*mode\s*===\s*['"`]production['"`]/.test(viteConfig);
      log(`${hasBaseConfig ? '✅' : '❌'} Base path configurado para produção`, hasBaseConfig ? 'green' : 'red');
      if (!hasBaseConfig) valid = false;
    } catch (error) {
      log(`❌ Erro ao ler vite.config.ts: ${error.message}`, 'red');
      valid = false;
    }
  } else {
    valid = false;
  }

  return valid;
}

function checkGitHubActions() {
  log('\n🚀 Verificando GitHub Actions:', 'bold');
  
  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'deploy.yml');
  return checkFile(workflowPath, 'deploy.yml existe');
}

function runBuildTest() {
  log('\n🏗️ Testando Build:', 'bold');
  
  try {
    log('Executando npm run build...', 'yellow');
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Build executado com sucesso', 'green');
    
    // Verificar se os arquivos foram gerados
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (checkFile(indexPath, 'dist/index.html gerado')) {
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Erro no build: ${error.message}`, 'red');
    return false;
  }
}

function generateReport(results) {
  log('\n📊 Relatório Final:', 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const score = Math.round((passedTests / totalTests) * 100);
  
  log(`\nPontuação: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');
  log(`Testes aprovados: ${passedTests}/${totalTests}`, 'blue');
  
  if (score >= 90) {
    log('\n🎉 Excelente! Seu PWA está pronto para produção!', 'green');
  } else if (score >= 70) {
    log('\n⚠️ Bom, mas há algumas melhorias a fazer.', 'yellow');
  } else {
    log('\n❌ Várias correções são necessárias antes do deploy.', 'red');
  }

  // Mostrar itens que falharam
  const failedTests = Object.entries(results).filter(([, passed]) => !passed);
  if (failedTests.length > 0) {
    log('\n🔧 Itens que precisam de atenção:', 'yellow');
    failedTests.forEach(([test]) => {
      log(`  • ${test}`, 'yellow');
    });
  }

  return score;
}

// Executar todos os testes
async function main() {
  const results = {
    'Web App Manifest': checkManifest(),
    'Service Worker': checkServiceWorker(),
    'Ícones PWA': checkIcons(),
    'Sistema de Versionamento': checkVersionSystem(),
    'Configuração de Build': checkBuildConfiguration(),
    'GitHub Actions': checkGitHubActions(),
    'Build Test': runBuildTest()
  };

  const score = generateReport(results);
  
  // Exit code baseado na pontuação
  process.exit(score >= 70 ? 0 : 1);
}

main().catch(error => {
  log(`❌ Erro inesperado: ${error.message}`, 'red');
  process.exit(1);
});