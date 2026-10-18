const { getStore, connectLambda } = require('@netlify/blobs');

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  try {
    // 기존 handler 방식 함수에서는 Blobs 연결 정보를 이렇게 넘겨줘야 해요.
    if (event.blobs) connectLambda(event);

    const key = (event.queryStringParameters && event.queryStringParameters.key) || '';
    if (!key) return json(400, { error: 'key is required' });

    const store = getStore('calendar-sync');

    if (event.httpMethod === 'GET') {
      const data = await store.get(key, { type: 'json' });
      return json(200, { data: data || null });
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (err) {
        return json(400, { error: 'invalid json body' });
      }
      await store.setJSON(key, body);
      return json(200, { ok: true });
    }

    return json(405, { error: 'method not allowed' });
  } catch (err) {
    return json(500, { error: String((err && err.message) || err) });
  }
};
