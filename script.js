/*
variables:
//visibles en calculadora
-tipo de operacion: short o long (tipoOperacion)
-% recompra/reventa: porcentaje de recompra-distancia (distanciaRecompra)
-% monedas: porcentaje de aumento por cada recompra (montoPorRecompra)
-$ stop loss: sl en usdt (slUSDT)
-$ precio de entrada: precio de compra de la moneda, en usdt (precioMoneda)
-cantidad de monedas: cantidad de monedas en la primera compra (cantidadMonedasPrimeraCompra)

//no visibles
-cantidad de usdt invertidos en primera compra (montoInvertido)

*/

/*
proceso

1. voy a entrar a una moneda con 5 usdt (montoInvertido)
2. Cotizacion moneda al momento de comprarla (precioMoneda)
3. Cantidad de monedas en la primera compra:
    montoInvertido / precioMoneda = cantidadMonedasPrimeraCompra
4. Calculo de las recompras:

*/

/*function redondear(numero, numeroDecimales){
    if (typeof numero != 'number' || typeof numeroDecimales != 'number'){
        return null;
    }

    let signo = numero >= 0? 1 : -1;

    return (Math.round((numero * Math.pow(10, numeroDecimales)) + (signo * 0.0001)) / Math.pow(10, numeroDecimales)).toFixed(numeroDecimales);
}
*/

//declaro objeto operacion
class Operacion{
    //constructor de la clase
    constructor(numeroOperacion = 0, tipoOperacion, par = "predeterminado", distanciaPorcentajeRecompraReventa = 0, aumentoPorcentajeRecompraReventa = 0, sl, precioMoneda = 0, cantidadMonedas = 0, montoInvertido = 0){
        this.numeroOperacion = numeroOperacion;
        this.tipoOperacion = tipoOperacion;
        this.par = par
        this.distanciaPorcentajeRecompraReventa = distanciaPorcentajeRecompraReventa;
        this.aumentoPorcentajeRecompraReventa = aumentoPorcentajeRecompraReventa;
        this.sl = sl;
        this.precioMoneda = precioMoneda;
        this.cantidadMonedas = cantidadMonedas;
        this.montoInvertido = montoInvertido;
    }

    //metodos de la clase
    calcularMontoInvertido(precioMoneda, cantidadMonedas){
        this.montoInvertido = precioMoneda * cantidadMonedas;
    }
    
    mostrarDatosOperacionInicial(){
        const divDatosCompraInicial = document.getElementById('divDatosCompraInicial');

        divDatosCompraInicial.innerHTML += `
        <p> Moneda: ${this.par} </p>
        <p> Precio de compra: $${this.precioMoneda} </p>
        <p> Monto invertido en dolares: $${this.montoInvertido.toFixed(3)} </p>
        <p> Tamaño compra: ${this.cantidadMonedas} monedas </p>
        <p> Tipo de operacion: ${this.tipoOperacion} </p>    `
    }

}

//FUNCIONES

//Funcion asincrona que crea elemento del dom para mostrar todas las monedas almacenadas en un archivo json
async function mostrarMonedas(){
    const monedas = await fetch("./json/monedas.json");
    const monedasParseadas = await monedas.json();

    par.innerHTML = "";

    par.innerHTML += `
        <option selected disabled value=""> SELECT </option>
    `
    monedasParseadas.forEach((moneda) => {
        par.innerHTML += `
        <option value="${moneda.symbol}">${moneda.symbol}</option>

        `
    });


}

//Mostrar operaciones de recompra / reventa
function mostrarOperaciones(operaciones, gridOperaciones){
    gridOperaciones.innerHTML += `
  
    <div class="row">
        <div class="col"> # </div>
        <div class="col"> PRECIO </div>
        <div class="col"> MONEDA </div>
        <div class="col"> USDT </div>
    </div>
    `

    operaciones.forEach((operacion, indice) => {
        //no muestro operacion inicial, solo las recompras / reventas que es lo que me interesa para operar
        if(indice != 0){
            gridOperaciones.innerHTML += `  
            <div class="row">
                <div class="col"> ${operacion.numeroOperacion} </div>
                <div class="col"> $${operacion.precioMoneda.toFixed(3)} </div>
                <div class="col"> ${operacion.cantidadMonedas.toFixed(3)} </div>
                <div class="col"> $${operacion.montoInvertido.toFixed(2)} </div>
            </div>
            `    
        }
    });
}

//Calcular PnL de operaciones, ya sea de short o long
function calcularPnL(cantidadMonedas, precioMonedaInicial, precioMonedaFinal, tipoOperacion){
    let pnl;

    if(tipoOperacion == "short"){
        pnl = cantidadMonedas * (precioMonedaFinal - precioMonedaInicial);
    } else if(tipoOperacion == "long"){
        pnl = (cantidadMonedas * (precioMonedaFinal - precioMonedaInicial)) * -1;
    }
    
    return pnl;
        //pnl = operaciones[0].cantidadMonedas * (operaciones[nroOperacionAnterior].precioMoneda - precioMoneda);      
}

//Almacenar array de objetos en localStorage
function almacenarLocalStorage(index, objectsArray){
    localStorage.setItem(index, JSON.stringify(objectsArray));
}

//comprobar si existe un array de objetos en un indice determinado, si existe lo devuelve, sino, crea un array de objetos vacio
function comprobarLocalStorage(index){
    //compruebo si esta creado mi localStorage, si no esta creado lo creo, y si esta, le envio las operaciones que tenia previamente
    return JSON.parse(localStorage.getItem(index)) ?? [];
}

//Calcular precio de moneda por operacion
function calcularPrecioMoneda(precioMoneda, distanciaPorcentajeRecompraReventa, tipoOperacion){
    //let precioMonedaCalculada = ((precioMoneda * distanciaPorcentajeRecompraReventa) / 100);
    let precioMonedaCalculada;

    if(tipoOperacion === "short"){
        //precioMonedaCalculada += precioMoneda;
        precioMonedaCalculada = precioMoneda * ( 1 + distanciaPorcentajeRecompraReventa / 100);
    } else if(tipoOperacion === "long"){
        //precioMonedaCalculada = -1 * precioMonedaCalculada + precioMoneda;
        precioMonedaCalculada = precioMoneda * ( 1 - distanciaPorcentajeRecompraReventa / 100);
    }
    return precioMonedaCalculada;  
}

//Calcular cantidad de monedas por operacion
function calcularCantidadMonedas(cantidadMonedas, aumentoPorcentajeRecompraReventa){
    return cantidadMonedas * (1 + aumentoPorcentajeRecompraReventa / 100);
    //return ((cantidadMonedas * aumentoPorcentajeRecompraReventa) / 100) + cantidadMonedas;
}

//Calcular inversion
function calcularInversion(precioMoneda, cantidadMonedas){
    return precioMoneda * cantidadMonedas;
}

//Calcular precio de moneda para un sl determinado
function calcularPrecioMonedaEnSl(precioMoneda, cantidadMonedas, sl, tipoOperacion){
    if(tipoOperacion === "short"){
        return precioMoneda + (sl / cantidadMonedas);
    } else if(tipoOperacion === "long"){
        return (-1 * sl / cantidadMonedas) + precioMoneda;
    }

}

//Calcular porcentaje distancia a SL
function calcularPorcentajeDistanciaSl(precioMonedaEnSl, precioMoneda, tipoOperacion){
    let porcentajeDistancia;
    if(tipoOperacion === "short"){
        porcentajeDistancia = ((precioMonedaEnSl - precioMoneda) / precioMoneda) * 100;
    } else if(tipoOperacion === "long"){
        porcentajeDistancia = ((precioMoneda - precioMonedaEnSl) / precioMoneda) * 100;
    }

    return porcentajeDistancia;
    
}

//Crear HTML de historial de operaciones, dado un div contenedor, y el array de objetos a mostrar
function crearHTMLHistorialOperaciones(divContenedor, arrayObject){
    arrayObject.forEach((operacion, indice) => {
        divContenedor.innerHTML += `  
            <div class="card bg-light mb-3" id="operacion${indice}" style="max-width: 20rem; margin: 4px;">
                <div class="card-header">${indice + 1}. ${operacion.par}</div>
                <div class="card-body" id="card-operacion">
                    <p class="card-text">Precio moneda: ${operacion.precioMoneda}</p>
                    <p class="card-text">Precio moneda: ${operacion.cantidadMonedas}</p>
                    <p class="card-text">Precio moneda: ${operacion.montoInvertido}</p>
                    <button type="button" class="btn btn-danger"> Eliminar Operacion </button>
                    <button type="button" class="btn btn-success"> Cargar datos </button>
                </div>
            </div>
        `
    });
}

//obtencion elementos del dom
const operacionesIniciales = comprobarLocalStorage("operacionesIniciales");
const form = document.getElementById('idForm');
const botonMostrarOperacionesIniciales = document.getElementById("idBtnDropDown");
//const idOperacionesInicialesLista = document.getElementById("idOperacionesInicialesLista");
const divOperacionesIniciales = document.getElementById("divOperacionesIniciales");
const gridOperaciones = document.getElementById("gridOperaciones");
const tipoOperacion = document.getElementById("tipoOperacion");
const botonCalcular = document.getElementById("botonCalcular");

//muestro las monedas que tengo en mi archivo json, funcion asincrona
mostrarMonedas();

//Historial de operaciones iniciales
let primerClick = true;
botonMostrarOperacionesIniciales.addEventListener("click", () => {

    if (primerClick == true){
        primerClick = false;
        const operacionesIniciales = comprobarLocalStorage("operacionesIniciales");

        //elimino todos los hijos de la lista, para cuando lo clickee no se repitan
        /*idOperacionesInicialesLista.innerHTML = "";

        operacionesIniciales.forEach((operacion, indice) => {
            idOperacionesInicialesLista.innerHTML += `
            <li id=operacion${indice}>
                <button class="btn btn-dark"> ${operacion.par} </button>
            </li>

            `
        });

        operacionesIniciales.forEach((operacion, indice) => {
            //duda, si es unico el elemento de la fomra operacionID, por que necesito identificarlo con lastElementChild
            let enlaceOperacion = document.getElementById(`operacion${indice}`).lastElementChild;

            //genero un evento escuchador por cada elemento de la lista
            enlaceOperacion.addEventListener("click", () => {
                //Lo recomendable siempre es eliminar el elemento primero en el DOM y luego en el localStorage
                //utilizo metodo remove(), asi elimino el item de la lista en particular
                document.getElementById(`operacion${indice}`).remove();

                //ahora eliminamos el elemento del array
                //recordar que con splice() eliminamos un elemento dado su indice, con slice() copiamos
                operacionesIniciales.splice(indice, 1);

                //eliminamos el objeto del localStorage
                localStorage.setItem("operacionesIniciales", JSON.stringify(operacionesIniciales));
            });

        });
        */
        divOperacionesIniciales.innerHTML = "";

        crearHTMLHistorialOperaciones(divOperacionesIniciales, operacionesIniciales);
       
        operacionesIniciales.forEach((operacion, indice) => {
            /*
            let enlaceOperacion = document.getElementById(`operacion${indice}`).lastElementChild;

            enlaceOperacion.addEventListener("click", () => {
                document.getElementById(`operacion${indice}`).remove();

                operacionesIniciales.splice(indice, 1);

                localStorage.setItem("operacionesIniciales", JSON.stringify(operacionesIniciales));
            });
            */
            let operacionEliminar = document.getElementById(`operacion${indice}`).lastElementChild.children[3];

            //let operacionEliminar = document.getElementById(`operacion${indice}`).lastElementChild.children
            let operacionInicialDatos = document.getElementById(`operacion${indice}`).lastElementChild.lastElementChild;

            //Boton cargar datos de operaciones
            operacionInicialDatos.addEventListener("click", () => {

                document.getElementById("tipoOperacion").value = operacion.tipoOperacion;
                document.getElementById("par").value = operacion.par;
                document.getElementById("distanciaPorcentajeRecompraReventa").value = operacion.distanciaPorcentajeRecompraReventa;
                document.getElementById("aumentoPorcentajeRecompraReventa").value = operacion.aumentoPorcentajeRecompraReventa;
                document.getElementById("sl").value = operacion.sl;
                document.getElementById("precioMoneda").value = operacion.precioMoneda;
                document.getElementById("cantidadMonedas").value = operacion.cantidadMonedas;
            });

            operacionEliminar.addEventListener("click", () => {
                Swal.fire({
                    title: 'Desea eliminar la operacion?',
                    showDenyButton: false,
                    showCancelButton: true,
                    confirmButtonText: 'Si',
                    denyButtonText: `No`,
                  }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        //primero elimino elemento del dom
                        document.getElementById(`operacion${indice}`).remove();

                        //luego lo elimino del array de objetos
                        operacionesIniciales.splice(indice, 1);
            
                        //luego lo borro del localStorage
                        localStorage.setItem("operacionesIniciales", JSON.stringify(operacionesIniciales));

                        Swal.fire('Operacion Eliminada', '', 'success')
                    }
                  })
            });
        });
    } else {
        primerClick = true;
        divOperacionesIniciales.innerHTML = "";
    }
});

//
tipoOperacion.addEventListener("click", () => {
    if(tipoOperacion.value == "short"){
        botonCalcular.style.background = "red";
    } else if(tipoOperacion.value == "long"){
        botonCalcular.style.background = "blue";
    }
})
form.addEventListener("submit", (event) => {
    event.preventDefault();

    let tipoOperacion, par, distanciaPorcentajeRecompraReventa, aumentoPorcentajeRecompraReventa, sl, precioMoneda, cantidadMonedas;
    //let numeroRecomprasTotales;
    //let mostrarListaInvertida;

    //metodo de js que extrae la informacion de los campos de un formulario objetivo
    let dataForm = new FormData(event.target);
    //hago este paso para que sea mas legible pero podria directamente crear el objeto con los datos que vengan del objeto dataForm
    tipoOperacion = dataForm.get("operacion");
    par = dataForm.get("parName");
    distanciaPorcentajeRecompraReventa = parseFloat(dataForm.get("distanciaPorcentajeRecompraReventaName"));
    aumentoPorcentajeRecompraReventa = parseFloat(dataForm.get("aumentoPorcentajeRecompraReventaName"));
    sl = parseFloat(dataForm.get("slName"));
    precioMoneda = parseFloat(dataForm.get("precioMonedaName"));
    cantidadMonedas = parseFloat(dataForm.get("cantidadMonedasName"));

    if((distanciaPorcentajeRecompraReventa && aumentoPorcentajeRecompraReventa && sl && precioMoneda && cantidadMonedas) > 0){

        //almaceno el valor de los input del html en variables let
        /*tipoOperacion = (document.getElementById('tipoOperacion').value);
        par = (document.getElementById('par').value).toUpperCase();
        distanciaPorcentajeRecompraReventa = parseFloat(document.getElementById('distanciaPorcentajeRecompraReventa').value);
        aumentoPorcentajeRecompraReventa = parseFloat(document.getElementById('aumentoPorcentajeRecompraReventa').value);
        sl = parseFloat(document.getElementById('sl').value);
        precioMoneda = parseFloat(document.getElementById('precioMoneda').value);

        cantidadMonedas = parseFloat(document.getElementById('cantidadMonedas').value);*/

        //compruebo si mi localStorage hay almacenadas operaciones, sino creo una nueva
        //la coloco aqui tambien porque si...
        const operacionesIniciales = comprobarLocalStorage("operacionesIniciales");

        //contiene las operaciones, de recompra o reventa, incluida compra/venta incial
        const operaciones = [];
        //contiene todas las operaciones promediadas
        const operacionesProm = [];

        const divDatosCompraInicial = document.getElementById("divDatosCompraInicial");
        divDatosCompraInicial.innerHTML ="";

        const gridOperaciones = document.getElementById("gridOperaciones");
        gridOperaciones.innerHTML = "";

        //creo el objeto inicial, con los datos que me ingresaron en el html
        const operacion0 = new Operacion(0, tipoOperacion, par, distanciaPorcentajeRecompraReventa, aumentoPorcentajeRecompraReventa, sl, precioMoneda, cantidadMonedas);
        operaciones.push(operacion0);

        operaciones[0].calcularMontoInvertido(precioMoneda, cantidadMonedas);

        //operaciones[0].calcularRecomprasReventas(sl, distanciaPorcentajeRecompraReventa);

        //La calculadora no permite mas que calcular 8 recompras, mas recompras, no se recomienda

        //let precioMonedaAcum = 0;
        //let cantidadMonedasAcum = 0;
        //let montoInvertidoAcum = 0;
        let precioMonedaEnSl = 0;
        let porcentajeDistanciaSl = 0;
        //let porcentajeTotalOperaciones = 0;
        let i = 0;
        let pnl = 0;

        if(operaciones[0].tipoOperacion === "short" || operaciones[0].tipoOperacion === "long"){
            operaciones[0].mostrarDatosOperacionInicial();

            do{
                i += 1; 
                //creo una variable nroOperacion y nroOperacionAnterior para que sea mas legible
                let nroOperacion = i;
                let nroOperacionAnterior = i-1;
                let nroOperacionProm = i;

                //datos Recompras
                let precioMoneda = calcularPrecioMoneda(operaciones[nroOperacionAnterior].precioMoneda, operaciones[nroOperacionAnterior].distanciaPorcentajeRecompraReventa, operaciones[0].tipoOperacion);
                let cantidadMonedas = calcularCantidadMonedas(operaciones[nroOperacionAnterior].cantidadMonedas, operaciones[nroOperacionAnterior].aumentoPorcentajeRecompraReventa);
                let inversion = calcularInversion(precioMoneda, cantidadMonedas);

                //Datos operaciones Promediadas
                let cantidadMonedasProm;
                let precioMonedaProm;
                let inversionProm;
                
                if(i === 1){
                    pnl = calcularPnL(operaciones[0].cantidadMonedas, operaciones[nroOperacionAnterior].precioMoneda, precioMoneda, operaciones[0].tipoOperacion);

                } else {
                    nroOperacionProm = nroOperacionAnterior - 1;

                    pnl = calcularPnL(operacionesProm[nroOperacionProm].cantidadMonedas, operacionesProm[nroOperacionProm].precioMoneda, precioMoneda, operaciones[0].tipoOperacion);
                    //pnl = operacionesProm[nroOperacionProm].cantidadMonedas * (precioMoneda - operacionesProm[nroOperacionProm].precioMoneda);

                }

                if(pnl <= operaciones[0].sl){
                    const operacion = new Operacion(nroOperacion, operaciones[0].tipoOperacion, par, operaciones[0].distanciaPorcentajeRecompraReventa, operaciones[0].aumentoPorcentajeRecompraReventa, operaciones[0].sl, precioMoneda, cantidadMonedas, inversion);    
                    operaciones.push(operacion);

                    if(i === 1){
                        precioMonedaProm = (operaciones[nroOperacionAnterior].montoInvertido + operaciones[nroOperacion].montoInvertido) / (operaciones[nroOperacionAnterior].cantidadMonedas + operaciones[nroOperacion].cantidadMonedas);
                        cantidadMonedasProm = operaciones[nroOperacionAnterior].cantidadMonedas + operaciones[nroOperacion].cantidadMonedas;


                    } else{
                        precioMonedaProm = (operacionesProm[nroOperacionProm].montoInvertido + operaciones[nroOperacion].montoInvertido) / (operacionesProm[nroOperacionProm].cantidadMonedas + operaciones[nroOperacion].cantidadMonedas);
                        cantidadMonedasProm = operacionesProm[nroOperacionProm].cantidadMonedas + operaciones[nroOperacion].cantidadMonedas;
                    }

                    inversionProm = calcularInversion(precioMonedaProm, cantidadMonedasProm);

                    const operacionProm = new Operacion(nroOperacion, operaciones[0].tipoOperacion, par, operaciones[0].distanciaPorcentajeRecompraReventa, operaciones[0].aumentoPorcentajeRecompraReventa, operaciones[0].sl, precioMonedaProm, cantidadMonedasProm, inversionProm);
                    operacionesProm.push(operacionProm);
                }
                
                
            } while(pnl <= operaciones[0].sl && i < 8);
                
            //guardo datos de mis operaciones para localStorage
            operacionesIniciales.push(operacion0);

            //localStorage.setItem("operacionesIniciales", JSON.stringify(operacionesIniciales));
            almacenarLocalStorage("operacionesIniciales", operacionesIniciales);

            mostrarOperaciones(operaciones, gridOperaciones);

            /*gridOperaciones.innerHTML += `
    
            <div class="row">
                <div class="col"> # </div>
                <div class="col"> PRECIO </div>
                <div class="col"> MONEDA </div>
                <div class="col"> USDT </div>
            </div>
            `

            operaciones.forEach(operacion => {
                gridOperaciones.innerHTML += `  
                <div class="row">
                    <div class="col"> ${operacion.numeroOperacion} </div>
                    <div class="col"> $${operacion.precioMoneda.toFixed(3)} </div>
                    <div class="col"> ${operacion.cantidadMonedas.toFixed(3)} </div>
                    <div class="col"> $${operacion.montoInvertido.toFixed(2)} </div>
                </div>
                `
            });
            */

            //extraigo la ultima operacion del arreglo
            let operacionPromUltima = operacionesProm.length - 1;

            //formula calculo precio de moneda cuando toca SL que elegi como dato de entrada en USDT.
            precioMonedaEnSl = calcularPrecioMonedaEnSl(operacionesProm[operacionPromUltima].precioMoneda, operacionesProm[operacionPromUltima].cantidadMonedas, operaciones[0].sl, operaciones[0].tipoOperacion);

            //formula calculo distancia de mi operacion #0 al monto de SL que quiero perder, en porcentaje
            porcentajeDistanciaSl = calcularPorcentajeDistanciaSl(precioMonedaEnSl, operaciones[0].precioMoneda, operaciones[0].tipoOperacion);

            console.log(`
            SL(${porcentajeDistanciaSl.toFixed(2)}%)
            Precio moneda al tocar SL: $${precioMonedaEnSl.toFixed(3)}
            Cantidad de monedas compradas utilizando todas las recompras: ${operacionesProm[operacionPromUltima].cantidadMonedas.toFixed(3)}
            Monto total invertido utilizando todas las recompras: $${operacionesProm[operacionPromUltima].montoInvertido.toFixed(3)}`);

            //reseteo el formulario
            form.reset();

        }

    }
});




