document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('buscar-terminal-form');
    const resultadosDiv = document.getElementById('resultados-terminales');

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        const ciudad = document.getElementById('ciudad').value;

        fetch('/buscar-terminales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ciudad: ciudad })
        })
        .then(response => response.json())
        .then(terminales => {
            resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores
            terminales.forEach(terminal => {
                // Asegúrate de que el campo 'nombre' exista en tu esquema de base de datos
                resultadosDiv.innerHTML += `<p>${terminal.nombre}</p>`;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            resultadosDiv.innerHTML = '<p>Hubo un error al buscar las terminales.</p>';
        });
    });
});
