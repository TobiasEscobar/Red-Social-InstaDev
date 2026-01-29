//Script para poder indicarle a vercel los environments que debe utilizar

const fs = require('fs');

const dir = './src/environments';
const targetFile = './src/environments/environment.ts';
const targetFileProd = './src/environments/environment.prod.ts';

// Crear el contenido leyendo las variables DE VERCEL
const envConfigFile = `export const environment = {
    production: true,
    apiUrl: '${process.env.API_URL}'
};
`;

// Crear carpeta si no existe
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Escribir los archivos
fs.writeFileSync(targetFile, envConfigFile);
fs.writeFileSync(targetFileProd, envConfigFile);

console.log('Environment generado correctamente desde Vercel');