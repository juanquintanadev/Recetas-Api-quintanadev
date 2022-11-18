// vamos a consultar a la api 3 end points
// uno para las categorias
// uno para los platos de las categorias
// y uno para la informacion de un plato

function inicarApp() {
    // seleccionamos el select 
    const cat = document.querySelector('#categorias');

    // vamos a seleccionar el div de favoritos donde colocaremos en la pagina de favoritos todo lo que fuimos almacenando el localstorage
    const favoritosDiv = document.querySelector('.favoritos');

    // elemento creado en el html donde vamos a inyectar nuestros resultados, tiene que estar creado en el html
    const resultado = document.querySelector('#resultado');

    // vamos a utilizar boostrap para crear una instancia de una ventana modal que viene configurado en boostrap
    const modal = new bootstrap.Modal('#modal', {}); // seleccionamos la parte del html donde tiene id modal y su segunda opcion son las opciones y ahora le ponemos un objeto vacio

    // vamos a escuchar por un evento de change, utilizado usualmente con un select
    if(cat) { // movimos esto adentro del if porque en la pagina favoritos no existe el select
        cat.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    };

    if(favoritosDiv) { // comprobamos que exista la seccion de favoritosDiv en la pagina de favoritos
        obtenerFavoritos();
    };
    
    function obtenerFavoritos() {
        // otra vez puede que el usuario ingrese por primera vez y no tenga favoritos entonces asignamos un arreglo vacio a la variable
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        console.log(favoritos);
        if(favoritos.length) { //  si hay 1 o mas elementos en el arreglo
            
            // reutilizamos la funcion antes creada para las modales
            mostrarRecetas(favoritos);
            return;
        };

        // en el caso de que no hay favoritos escribimos un texto con dicha descripcion
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'Aún no hay FAVORITOS';
        noFavoritos.classList.add('fs-4', 'font-bold', 'mt-5', 'text-center');

        favoritosDiv.appendChild(noFavoritos);

    };
    
    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => mostrarCategorias(datos.categories));
    };

    function mostrarCategorias(categorias = []) { // aca le ponemos que el parametro por default tiene que ser un arreglo!!
        

        categorias.forEach(cate => {
            const {strCategory} = cate; // esta api para seleccionar y pedir informacion sobre cierta categoria, hay que pasar esta variable

            // console.log(strCategory);
            const option = document.createElement('OPTION');
            option.textContent = strCategory;
            option.value = strCategory;

            // agregamos cada una de las categorias y las introducimos en el select como options
            cat.appendChild(option);
        });
    };

    function seleccionarCategoria(e) {
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => mostrarRecetas(datos.meals));
    };

    function mostrarRecetas(recetas = []) {
        // console.log(recetas);

        limpiarHtml(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados:' : 'No hay resultados'; // si recetas tiene un valor distinto a un arreglo vacio entonces muestra Resultados sino muestra no hay resultados

        resultado.appendChild(heading);

        // vamos a iterar sobre los resultados en modo arreglo
        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta;

            // contenedor donde va a tener todo el ancho del card
            const contenedor = document.createElement('DIV'); // esto se hace con boostrap, primero un contenedor para tener todo el ancho y luego dentro un card con su diseño
            contenedor.classList.add('col-md-4'); // con esto boostrap genera 3 columnas, divide 12 por 4

            // card individual donde vamos a el diseño y caracteristicas de las cards individuales
            const card = document.createElement('DIV');
            card.classList.add('card', 'mb-4');

            // creamos la imagen
            const img = document.createElement('IMG');
            img.classList.add('card-img-top');
            img.alt = `Imagen de la receta ${strMeal ?? receta.nombre}`;
            img.src = strMealThumb ?? receta.img; // si un valor existe entonces lo agregamos, sino le agregamos el otro

            // un body donde va el texto la descripcion y puede estar un boton
            const recetaBody = document.createElement('DIV');
            recetaBody.classList.add('card-body'); // le da estilos de boostrap

            // vamos a crear un heading para el titulo de la receta
            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-tittle', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.nombre; // si un valor existe entonces lo agregamos, sino le agregamos el otro, seria lo que le pasamos de localstorage

            // creamos el button donde se va a abrir la modal con la receta
            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            // dataset conectamos a boostrap target es el id de modal
            // tambien es necesario el bsToggle manda a llamar las funciones que estan en el archivo de jv de boostrap y mandamos a llamar modal
            // recetaButton.dataset.bsTarget = '#modal';
            // recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick = () => seleccionarReceta(idMeal ?? receta.id); // lo dejamos como callback y lo que hacemos es esperar que ocurra el evento click


            // console.log(recetaButton);
            // resultado.appendChild(card);

            // vamos a inyectar todo en el html
            recetaBody.appendChild(recetaHeading);
            recetaBody.appendChild(recetaButton);
            card.appendChild(img);
            card.appendChild(recetaBody);
            contenedor.appendChild(card);

            resultado.appendChild(contenedor);
        });
    };

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        // console.log(url);
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => mostrarRecetaModal(datos.meals[0]));
    };

    function mostrarRecetaModal(receta) {
        // console.log(receta);

        // destructuring a receta con lo que requerimos
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;

        // aca vamos a añadir contenido al modal, con los siguientes selectores
        const modalTitle = document.querySelector('.modal .modal-title'); // seleccionamos a todos por sus clases
        const modalBody = document.querySelector('.modal .modal-body');

        // aca vamos a ir inyectando al html, tenemos muchas cosas de bootstrap como el scroll etc
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img src="${strMealThumb}" class="img-fluid" alt="Imagen de ${strMeal}"/>
            <h3 class="my-3">Instrucciones:</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes</h3>
        `;

        // creamos un UL para listar todos los ingredientes con sus cantidades
        const ingredientesUL = document.createElement('UL');
        ingredientesUL.classList.add('list-group');

        // vamos a mostrar sus ingredientes con su medidas
        for(let i = 1; i <=20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                
                // creamos un li para cada item
                const ingredienteLI = document.createElement('LI');
                ingredienteLI.classList.add('list-group-item');
                ingredienteLI.textContent = `${ingrediente}: ${cantidad}`;

                ingredientesUL.appendChild(ingredienteLI);
            };
        };

        modalBody.appendChild(ingredientesUL);

        const modalFooter = document.querySelector('.modal .modal-footer');

        limpiarHtml(modalFooter);

        // vamos a generar al vuelo los botones de agergar a favoritos y cerrar
        const btnFavorito = document.createElement('BUTTON');
        const btnCerrar = document.createElement('BUTTON');

        btnFavorito.classList.add('btn', 'btn-danger', 'col'); // el col lo que hace es que van a medir lo mismo
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar a favoritos';
        btnCerrar.classList.add('btn', 'btn-secondary', 'col');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = () => modal.hide(); // simepre en function o arrow function porque sino la mandamos a llamar en automatico y no funciona

        // almacenar el contenido seleccionado en localStorage, donde vamos a almacenar y quitar elementos
        btnFavorito.onclick = () => { // nuevamente le asignamos una funcion al boton para que cuando de click esta se ejecute

            // utilizamos la funcion si ya existe en el storage antes de mandar a guardarlo
            if(existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Agregar a Favoritos';
                mostrarToast('Eliminado de favoritos');
                return;
            };

            agregarFavorito({
                id: idMeal,
                img: strMealThumb, // le pasamos un objeto con 3 elementos principales para almacenarlos en el localStorage
                nombre: strMeal,
            });
            btnFavorito.textContent = 'Eliminar de Favoritos';
            mostrarToast('Agregado a favoritos');
        };


        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrar);

        // utilizamos el metodo para mostrar el modal seleccionado con show, con hide lo va a ocultar
        modal.show();

    };

    // para eliminar solamente necesitamos el id
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevoFavorito = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevoFavorito));
    };

    // local storage solo almacena strings
    function agregarFavorito(receta) { // JSON.parse convierte todo a un arreglo
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; // nullish coalescing, en caso de que la expresion del lado izquierdo sea null aplica la del lado derecho, osea si no encuentra la llave favoritos, crea un arreglo

        // aca le asignamos a la llave favoritos
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta])); // JSON.stringify convierte todo a un string
    };

    // utilizamos una funcion de bootstrap para mostrar un mensaje con el toast
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast'); // este es el toast general que vamos a mostrar
        const toastBody = document.querySelector('.toast-body'); // aca ponemos el mensaje en el cuerpo del toast
        toastBody.textContent = mensaje;
        const toast = new bootstrap.Toast(toastDiv);

        toast.show();
    };

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; // aca va a asignar un arreglo con el contenido del localstorage con la llave favoritos
        return favoritos.some(favorito => favorito.id === id); // .some recorre el arreglo y por cada elemento en este caso seria objeto.id compara con el id que se esta pasando, este devuelve true o false
    };

    function limpiarHtml(selector) { // le ponemos selector para mandarla a llamar con cualquier elemento que queremos limpiar
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        };
    };
};

document.addEventListener('DOMContentLoaded', inicarApp);