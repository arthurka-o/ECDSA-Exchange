const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const secp = require('@noble/secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = {
  "0x02a40db21d6079259db4fd8c82a8a505e62110dbc3e1f6b1d8ad7ccdeeb5a3fcc4": 100,
  "0x020fa9390c16d7f1e86d8b0fbea3f910264b9d3d2a59d58c2f3438ce4e684bf12f": 50,
  "0x0237ca33fe7677459329e9e2c21300918783d3a0ed6c823f59285a5a92467f1dff": 75,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const {sender, recipient, amount, signature} = req.body;

  const messageHash = await secp.utils.sha256(new TextEncoder().encode(`${recipient}: ${amount}`));
  const isValid = secp.verify(signature, messageHash, sender.substr(2));

  if (isValid) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else {
    res.send({ error: "Incorrect signature" })
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

// 0x02a40db21d6079259db4fd8c82a8a505e62110dbc3e1f6b1d8ad7ccdeeb5a3fcc4
// e3f04a69dc642957a6fbac122b5821b50708d65958661aed29da52e59dba8d2a

// 0x020fa9390c16d7f1e86d8b0fbea3f910264b9d3d2a59d58c2f3438ce4e684bf12f
// c3c72990d6f1f312e7f7edc24da55a40f9d44a0c54b0d9976dc2c2261190a579

// 0x0237ca33fe7677459329e9e2c21300918783d3a0ed6c823f59285a5a92467f1dff
// 74f30390ce1d71427a9926ad53169a1e68382b5d1c50256e178508bb349974fe