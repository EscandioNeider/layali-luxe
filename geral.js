// Conversão de Dólar pra real
let cotacaoDolar = 0;

async function converterDolarParaReal() {
    try {
        let resposta = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        let dados = await resposta.json();
        cotacaoDolar = parseFloat(dados.USDBRL.bid) 

        // Atualizar os valores dos produtos
        document.querySelectorAll('.box-produto').forEach(produto => {
            let valorDolar = parseFloat(produto.getAttribute('data-dolar'));
            let valorReal = valorDolar * cotacaoDolar;
            produto.querySelector('.valor-real').textContent = `R$ ${valorReal.toFixed(2)}`;
        });
    } catch (error) {
        console.error('Erro ao obter cotação:', error);
    }
}
converterDolarParaReal();

var carrinhoAutorizado = false

// Consulta de CEP
async function consultarCEP() {
    let cep = document.getElementById('cep').value.trim();
    let resultadoCep = document.getElementById('resultado-cep');

    if (!/^[0-9]{8}$/.test(cep)) {
        resultadoCep.textContent = "CEP inválido! Insira apenas números.";
        return;
    }

    try {
        let resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let dados = await resposta.json();

        if (dados.erro) {
            resultadoCep.textContent = "CEP não encontrado!";
        } else {
            resultadoCep.textContent = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade} - ${dados.uf}`;
            carrinhoAutorizado = true
            calcularFrete(parseInt(cep, 10));
        }
    } catch (error) {
        resultadoCep.textContent = "Erro ao buscar o CEP! Tente novamente mais tarde.";
    }
}

// Tabela de fretes
function calcularFrete(cep) {
    let frete = 0;

    if (cep >= 1000000 && cep <= 39999999) { // Sudeste
        frete = 750;
    } else if (cep >= 80000000 && cep <= 99999999) { // Sul
        frete = 900;
    } else if (cep >= 40000000 && cep <= 65999999) { // Nordeste
        frete = 900;
    } else if (cep >= 66000000 && cep <= 68899999) { // Norte
        frete = 1000;
    } else if (cep >= 70000000 && cep <= 79999999) { // Centro-Oeste
        frete = 1000;
    }

    // Atualiza o valor do frete e do total
    document.querySelectorAll('.box-produto').forEach(produto => {
        let valorDolar = parseFloat(produto.getAttribute('data-dolar'));
        let valorReal = valorDolar * cotacaoDolar;
        let valorTotal = valorReal + frete;

        produto.querySelector('.valor-frete').textContent = `R$ ${frete.toFixed(2)}`;
        produto.querySelector('.valor-total').textContent = `R$ ${valorTotal.toFixed(2)}`;
    });
}

// Filtro de produtos por categorias
function filtrarProdutos(categoria) {
    // Seleciona todos os produtos
    const produtos = document.querySelectorAll('.box-produto');
    
    for(let i = 0; i < document.getElementsByClassName("banner").length; i++){
        document.getElementsByClassName("banner")[i].style.display = "none"
    }
    // Para cada produto, verifica se a categoria do produto é a mesma da categoria passada como argumento
    produtos.forEach(produto => {
        // Verifica se o produto pertence à categoria
        if (produto.getAttribute('categoria') === categoria) {
            // Se for a categoria selecionada, mostra o produto
            produto.style.display = 'block';
        } else {
            // Caso contrário, esconde o produto
            produto.style.display = 'none';
        }
    });
}

// Aparecer div do frete
document.addEventListener("DOMContentLoaded", function () {
    carregarCarrinho();

    document.getElementById("meuFrete").addEventListener("click", function () {
        let carrinhoDiv = document.getElementById("tabFrete");
        carrinhoDiv.style.display = (carrinhoDiv.style.display === "none") ? "block" : "none";
    });
});


// Aparecer a div do carrinho
document.addEventListener("DOMContentLoaded", function () {
    carregarCarrinho();

    document.getElementById("meuCarrinho").addEventListener("click", function () {
        let carrinhoDiv = document.getElementById("teste");
        carrinhoDiv.style.display = (carrinhoDiv.style.display === "none") ? "block" : "none";
    });
});

let taxaDolar = 5.00; // Simulação da taxa de câmbio (ajuste para a cotação real)
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Adiciona um produto ao carrinho
function colocarNoCarrinho(id) {
    let produto = document.getElementById(id);
    let nome = produto.querySelector("h3").innerText;
    let imagem = produto.querySelector("img").src;
    let precoDolar = parseFloat(produto.getAttribute("data-dolar"));
    let precoReal = precoDolar * taxaDolar;

    let itemExistente = carrinho.find(item => item.id === id);

    if (!itemExistente) {
        carrinho.push({ id, nome, imagem, precoDolar, precoReal });
    }
    alert("Item adicionado ao carrinho")

    salvarCarrinho();
    exibirCarrinho();
}

// Salva o carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Exibe os itens no carrinho
function exibirCarrinho() {
    let listaCarrinho = document.getElementById("itensCarrinho");
    let totalCarrinho = document.getElementById("total");

    listaCarrinho.innerHTML = "";

    carrinho.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" width="50">
            <p>${item.nome}</p>
            <p>Preço: $${item.precoDolar.toFixed(2)}</p>
            <p>Em Real: R$${item.precoReal.toFixed(2)}</p>
            <hr>
        `;
        listaCarrinho.appendChild(li);
    });

    let total = carrinho.reduce((sum, item) => sum + item.precoReal, 0);
    totalCarrinho.innerText = `R$ ${total.toFixed(2)}`;
}

// Carrega os itens do carrinho ao abrir a página
function carregarCarrinho() {
    exibirCarrinho();
}

// Limpa o carrinho inteiro
function EsvaziarCarrinho() {
    carrinho = [];
    salvarCarrinho();
    exibirCarrinho();
}

// Finaliza a compra
function RealizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    if(!carrinhoAutorizado){
        alert("Necessário colocar o CEP para o frete!")
        return
    }

    alert("Compra realizada com sucesso!");
    EsvaziarCarrinho();
}
