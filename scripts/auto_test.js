(async () => {
  const base = 'http://localhost:3000';
  try {
    console.log('1) Criando recebedor...');
    let res = await fetch(base + '/receivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teste Auto', balance: 0 })
    });
    const receiver = await res.json();
    console.log('=> receiver:', JSON.stringify(receiver, null, 2));

    const receiverId = receiver.id;
    console.log('\n2) Criando operação (gross_value = 100000 centavos)...');
    res = await fetch(base + '/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: receiverId, gross_value: 100000 })
    });
    const operation = await res.json();
    console.log('=> operation:', JSON.stringify(operation, null, 2));

    const opId = operation.id;
    console.log('\n3) Confirmando operação...');
    res = await fetch(`${base}/operations/${opId}/confirm`, { method: 'POST' });
    const confirm = await res.json();
    console.log('=> confirm result:', JSON.stringify(confirm, null, 2));

    console.log('\n4) Consultando recebedor com histórico...');
    res = await fetch(`${base}/receivers/${receiverId}`);
    const full = await res.json();
    console.log('=> receiver with history:', JSON.stringify(full, null, 2));

    console.log('\nAuto-test concluído com sucesso.');
     // process.exit(0); // Removed to allow Node to exit gracefully
  } catch (err) {
    console.error('Erro no auto-test:', err);
     // process.exit(1); // Removed to allow Node to exit gracefully
  }
})();
