/**
 * Vercel 入口函数 - 最小版本
 */

export default async function handler(req, res) {
  const url = req.url || '';

  // 根路径
  if (url === '/' || url === '/index.html') {
    // 直接返回精简的 HTML
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI 教学设计生成器</title>
</head>
<body>
<h1>AI 教案生成器</h1>
<p>Loading...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // 其他路径返回 404
  return res.status(404).send('Not found');
}