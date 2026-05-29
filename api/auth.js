export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'repo,user',
    });
    res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      res.status(400).send(`OAuth-Fehler: ${data.error_description || 'Unbekannter Fehler'}`);
      return;
    }

    const payload = JSON.stringify({ token: data.access_token, provider: 'github' });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><body><script>
(function(){
  var payload=${JSON.stringify(payload)};
  function onMessage(e){
    e.source.postMessage('authorization:github:success:'+payload,e.origin);
  }
  window.addEventListener('message',onMessage,false);
  window.opener.postMessage('authorizing:github','*');
})();
<\/script></body></html>`);
  } catch (err) {
    res.status(500).send('Serverfehler beim OAuth-Austausch.');
  }
}
