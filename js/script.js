let grafico;

document.addEventListener("DOMContentLoaded", carregarDadosGlobais);

document.getElementById("paisInput").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    buscarPais();
  }
});

// Buscar dados globais
async function carregarDadosGlobais() {
  try {
    const resposta = await fetch("https://disease.sh/v3/covid-19/all");
    if (!resposta.ok) throw new Error("Erro na API global");

    const dados = await resposta.json();
    console.log("Dados globais:", dados);
    atualizarDashboard(dados);
  } catch (erro) {
    console.error("Falha ao carregar dados globais:", erro);
  }
}

// Buscar dados por país
async function buscarPais() {
  const pais = document.getElementById("paisInput").value.trim();
  const erro = document.getElementById("mensagemErro");

  if (!pais) {
    erro.textContent = "Digite um país válido.";
    return;
  }

  try {
    const resposta = await fetch(
      `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(pais)}`
    );
    if (!resposta.ok) throw new Error("País não encontrado");

    const dados = await resposta.json();
    console.log("Dados do país:", dados);

    erro.textContent = "";
    atualizarDashboard(dados);
  } catch (e) {
    erro.textContent = "Não foi possível encontrar esse país.";
    console.error("Erro ao buscar país:", e);
  }
}

function atualizarDashboard(dados) {
  const tituloGrafico = document.getElementById("tituloGrafico");
  if (dados.country) {
    const flagImg = `<img src="${dados.countryInfo.flag}" alt="Bandeira de ${dados.country}" style="height: 20px; vertical-align: middle; margin-bottom: 4px;">`;
    tituloGrafico.innerHTML = `<i class="bi bi-pie-chart-fill"></i> Distribuição de Casos – ${flagImg} ${dados.country}`;
  } else {
    tituloGrafico.innerHTML = `<i class="bi bi-pie-chart-fill"></i> Distribuição de Casos – <i class="bi bi-globe"></i> Dados Globais`;
  }

  document.getElementById("ativos").textContent = formatarNumero(dados.active ?? 0);
  document.getElementById("mortes").textContent = formatarNumero(dados.deaths ?? 0);
  document.getElementById("recuperados").textContent = formatarNumero(dados.recovered ?? 0);
  document.getElementById("testes").textContent = formatarNumero(dados.tests ?? 0);

  criarGrafico(dados);
}

// Formatar números com separador de milhar
function formatarNumero(num) {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("pt-BR");
}

// Criar gráfico de pizza
function criarGrafico(dados) {
  const ctx = document.getElementById("graficoPizza").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Recuperados", "Mortes"],
      datasets: [{
        data: [
          dados.active ?? 0,
          dados.recovered ?? 0,
          dados.deaths ?? 0
        ],
        backgroundColor: ["#ffc107", "#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// Formulário
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

function validarFormulario() {
  const cpf = document.getElementById("cpf").value;
  const erro = document.getElementById("erroCpf");
  const sucesso = document.getElementById("mensagemSucesso");

  if (!validarCPF(cpf)) {
    erro.textContent = "CPF inválido!";
    return false;
  }

  erro.textContent = "";

  sucesso.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      Formulário enviado com sucesso!
    </div>
  `;

  setTimeout(() => {
    const alertDiv = sucesso.querySelector(".alert");
    if (alertDiv) {
      alertDiv.classList.remove("show");
      alertDiv.classList.add("hide");
      setTimeout(() => sucesso.innerHTML = "", 500);
    }
  }, 3000);

  document.getElementById("formContato").reset();

  return false;
}
