const seleccionDeDivisa = document.querySelector("#currency");
const montoAConvertir = document.querySelector("#inputAmount");
const montoConvertido = document.querySelector("#total");
const btnConvertir = document.querySelector("#button");
const grafica = document.querySelector("#myChart");
const nota = document.querySelector(".footer");
const errorGrafica = document.querySelector("#grafica");
const apiURL = "https://mindcador.cl/api";
const apiURLAlternativa = "./mindicador.json";

const getData = async () => {
    try {
        let res = await fetch(apiURL);
        let data = await res.json();
        return data;
    } catch (error) {
        let res = await fetch(apiURLAlternativa);
        let data = await res.json();
        console.error(error.message);
        return data;
    }
};

const getDivisas = async () => {
    const divisasValidas = ["dolar", "euro", "uf"];
    const data = await getData();
    const divisas = Object.values(data).filter((d) => divisasValidas.includes(d.codigo));
    return divisas;
};

const renderDivisas = async () => {
    const data = await getDivisas();
    let template = "";
    data.forEach((divisa) => {
        if (divisa) {
            template += `
            <option value="${divisa.valor}" data-codigo=${divisa.codigo}>${divisa.nombre} = CLP ${divisa.valor}</option>
            `;
        }
    });
    seleccionDeDivisa.innerHTML += template;
};

let divisaSeleccionada = "";

seleccionDeDivisa.addEventListener("change", (e) => {
    divisaSeleccionada = e.target.selectedOptions[0].dataset.codigo;
    return e.target.value;
});

btnConvertir.addEventListener("click", () => {
    convertir(seleccionDeDivisa.value);
});

const convertir = (monto) => {
    const valorAConvertir = montoAConvertir.value;
    const valorDivisa = Number(monto);
    if (!valorAConvertir || !valorDivisa) return alert("Debe ingresar un monto a convertir y seleccionar una divisa");
    const valorConvertido = (valorAConvertir / valorDivisa).toFixed(2);
    montoConvertido.innerHTML = numeroFormateado = valorConvertido;
    montoConvertido.style.fontWeight = "bold";
    getDataMonedas();
};

let labels = [];
let valores = [];

const myChart = new Chart("myChart", {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Valor",
                data: valores,
                backgroundColor: "rgba(78, 78, 78, 1)",
                borderColor: "rgba(68, 68, 68, 1)",
            },
        ],
    },
    options: {
        scales: {
            x: {
                ticks: {
                    maxRotation: 90,
                    minRotation: 45,
                },
            },
        },
    },
});

const getDataMonedas = async () => {
    try {
        if (!divisaSeleccionada) return;
        const res = await fetch(`${apiURL}/${divisaSeleccionada}`);
        const data = await res.json();
        const ultimasFechas = data.serie.slice(0, 10).reverse();
        labels = ultimasFechas.map((d) => new Date(d.fecha).toLocaleDateString());
        valores = ultimasFechas.map((d) => d.valor);
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = valores;
        myChart.update();
    } catch (error) {
        errorGrafica.innerHTML = `<p style="color: gray;">Sin Datos Estadísticos Disponibles por el momento!</p>`;
        nota.innerHTML = `<p style="color: red; font-size: 0.8em">Sin conexión a "https://mindicador.cl/"... redirigiendo a API alternativa.</p>`;
    }
};

renderDivisas();
