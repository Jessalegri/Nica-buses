/* Declarar constante */
const menu = document.querySelector('.menu');
const navegacion = document.querySelector('.menu-navegacion');

console.log(menu)
console.log(navegacion)


/* Declarar evento */
menu.addEventListener('click', ()=>{
    navegacion.classList.toggle("spread")
})