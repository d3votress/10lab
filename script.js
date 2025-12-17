const connectButton = document.getElementById('connectButton');
const accountInfo = document.getElementById('accountInfo');

if (window.ethereum) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  connectButton.onclick = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    accountInfo.innerHTML = `
      <p>Адрес: ${address}</p>
      <p>Баланс (Wei): ${balance.toString()}</p>
      <p>Баланс (ETH): ${ethers.utils.formatEther(balance)}</p>
    `;
  };
} else {
  accountInfo.innerText = 'MetaMask не установлен';
}
