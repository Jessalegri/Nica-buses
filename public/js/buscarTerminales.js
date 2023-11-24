document.getElementById('buscar-terminal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const ciudad = document.getElementById('ciudad').value.toLowerCase();

    fetch('/buscar-terminales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ciudad: ciudad })
    })
    .then(response => response.json())
    .then(terminales => {
        const resultadosDiv = document.getElementById('resultados-terminales');
        resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores

        if (terminales.length > 0) {
            terminales.forEach(terminal => {
                resultadosDiv.innerHTML += `<p>${terminal.terminal}</p>`;
            });
        } else {
            resultadosDiv.innerHTML = '<p>No se encontraron terminales para esta ciudad.</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultadosDiv.innerHTML = '<p>Hubo un error al buscar las terminales.</p>';
    });
});
