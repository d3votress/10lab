const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 hex
const statusEl = document.getElementById('status');
const msgOut = document.getElementById('messageOut');

const connectBtn = document.getElementById('connectBtn');
const setBtn = document.getElementById('setBtn');
const getBtn = document.getElementById('getBtn');

const contractAddress = '0xCC978e213c9D683bB7141B871000a460892dA6b4';

// ABI под функции setMessage/getMessage
const contractAbi = [
  {
    "inputs":[{"internalType":"string","name":"_message","type":"string"}],
    "name":"setMessage",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[],
    "name":"getMessage",
    "outputs":[{"internalType":"string","name":"","type":"string"}],
    "stateMutability":"view",
    "type":"function"
  }
];

let provider, signer, contract;

function setStatus(html) {
  statusEl.innerHTML = html;
}

async function ensureSepolia() {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: SEPOLIA_CHAIN_ID }]
  });
}

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    setStatus('<p style="color:red">MetaMask не установлен</p>');
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await ensureSepolia();

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const address = await signer.getAddress();
    const bal = await provider.getBalance(address);
    const net = await provider.getNetwork();

    contract = new ethers.Contract(contractAddress, contractAbi, signer);

    setStatus(`
      <p><b>Сеть:</b> ${net.name} (chainId: ${net.chainId})</p>
      <p><b>Адрес:</b> ${address}</p>
      <p><b>Баланс:</b> ${ethers.utils.formatEther(bal)} ETH</p>
      <p><b>Контракт:</b> ${contractAddress}</p>
    `);
  } catch (e) {
    console.error(e);
    setStatus(`<p style="color:red">Ошибка: ${e.message}</p>`);
  }
};

getBtn.onclick = async () => {
  try {
    if (!contract) throw new Error('Сначала подключи кошелёк');
    const m = await contract.getMessage();
    msgOut.textContent = m;
  } catch (e) {
    console.error(e);
    setStatus(`<p style="color:red">Ошибка: ${e.message}</p>`);
  }
};

setBtn.onclick = async () => {
  try {
    if (!contract) throw new Error('Сначала подключи кошелёк');

    const message = document.getElementById('messageInput').value;
    if (!message) throw new Error('Введите сообщение');

    const tx = await contract.setMessage(message);
    setStatus(`<p>Транзакция отправлена: ${tx.hash}</p><p>Жду подтверждение…</p>`);

    await tx.wait();
    setStatus(`<p style="color:green">Готово ✅ Транзакция подтверждена: ${tx.hash}</p>`);

    // обновим вывод
    const m = await contract.getMessage();
    msgOut.textContent = m;
  } catch (e) {
    console.error(e);
    setStatus(`<p style="color:red">Ошибка: ${e.message}</p>`);
  }
};

// обновление при смене сети/аккаунта
if (window.ethereum) {
  window.ethereum.on('accountsChanged', () => window.location.reload());
  window.ethereum.on('chainChanged', () => window.location.reload());
}
