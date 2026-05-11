// Prueba rápida de construcción de URL

const BASE_URL = "https://oracleapex.com/ords/josegalvez/paginaweb";

// Valores de prueba
const testData = {
  modelo: "Chevrolet Agile 2011",
  tipoServicio: "M",
  viscosidad: "20W50",
  existencia: "1",
  idMarca: 9,
  idMarcaFiltroAceite: 25,
  idMarcaFiltroAire: 25,
  idMarcaFiltroCombustible: 25,
  idMarcaFiltroCaja: 0,
  descuento: 0,
  idAceites: "857",
  cantidadLitros: "4",
  cantidadGalones: "1",
};

// Construir URL como lo hace React
const pathParams = `${encodeURIComponent(testData.modelo)}/${testData.tipoServicio}/${encodeURIComponent(testData.viscosidad)}/${testData.existencia}/${testData.idMarca}/${testData.idMarcaFiltroAceite}/${testData.idMarcaFiltroAire}/${testData.idMarcaFiltroCombustible}/${testData.idMarcaFiltroCaja}/${testData.descuento}/${encodeURIComponent(testData.idAceites)}/${testData.cantidadLitros}/${testData.cantidadGalones}`;

const urlFinal = `${BASE_URL}/cotizacion/${pathParams}`;

console.log("🔗 ===== PRUEBA DE URL =====");
console.log("\n📋 PARÁMETROS:");
console.log(`1. modelo: ${testData.modelo} (string)`);
console.log(`2. tipoServicio: ${testData.tipoServicio} (string)`);
console.log(`3. viscosidad: ${testData.viscosidad} (string)`);
console.log(`4. existencia: ${testData.existencia} (string)`);
console.log(`5. idMarca: ${testData.idMarca} (number)`);
console.log(`6. idMarcaFiltroAceite: ${testData.idMarcaFiltroAceite} (number)`);
console.log(`7. idMarcaFiltroAire: ${testData.idMarcaFiltroAire} (number)`);
console.log(`8. idMarcaFiltroCombustible: ${testData.idMarcaFiltroCombustible} (number)`);
console.log(`9. idMarcaFiltroCaja: ${testData.idMarcaFiltroCaja} (number)`);
console.log(`10. descuento: ${testData.descuento} (number)`);
console.log(`11. idAceites: ${testData.idAceites} (string)`);
console.log(`12. cantidadLitros: ${testData.cantidadLitros} (string)`);
console.log(`13. cantidadGalones: ${testData.cantidadGalones} (string)`);

console.log("\n✅ URL FINAL:");
console.log(urlFinal);

console.log("\n📊 DESGLOSE DE PARÁMETROS EN URL:");
const params = pathParams.split("/");
params.forEach((param, index) => {
  console.log(`  ${index + 1}. ${decodeURIComponent(param)}`);
});
