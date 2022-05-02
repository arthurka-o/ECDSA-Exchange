import "./index.scss";
import * as secp from "@noble/secp256k1";

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', async ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const signature = document.getElementById("signature").innerHTML;

  const body = JSON.stringify({
    sender, amount, recipient, signature
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then((res) => {
    if (res.balance) {
      document.getElementById("balance").innerHTML = res.balance;
    } else {
      document.getElementById("errors").innerHTML = res.error;
    }
  });
});

document.getElementById("sign-message").addEventListener('click', async () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("private-key").value;

  const messageHash = await secp.utils.sha256(new TextEncoder().encode(`${recipient}: ${amount}`));
  const signature = await secp.sign(messageHash, privateKey);
  

  document.getElementById("signature").innerHTML = secp.utils.bytesToHex(signature);
});