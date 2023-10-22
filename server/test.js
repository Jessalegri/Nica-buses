function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Pruebas de la función normalizeString
console.log(normalizeString("Estelí"));  // debería imprimir "esteli"
console.log(normalizeString("León"));    // debería imprimir "leon"
