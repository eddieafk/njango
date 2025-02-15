import fs from 'fs'
import path from 'path';
import urlpatterns from './projecturls.js'
import { fileURLToPath } from 'url';
import http from 'http'
import url from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Template Engine: if - elif - else - for desteği ile!
function renderTemplate(filePath, context, callback) {
    const fullPath = path.join(__dirname, 'views', filePath);

    fs.readFile(fullPath, 'utf-8', (err, content) => {
        if (err) {
            return callback('500 Internal Server Error', 'text/plain');
        }

        // 📌 {{ variable }} -> Değişkenleri dinamik olarak değiştirir
        content = content.replace(/{{\s*(\w+)\s*}}/g, (match, varName) => {
            return context[varName] || '';
        });

        // 📌 IF - ELIF - ELSE Mantığı
        content = content.replace(/{%\s*if\s+(\w+)\s*%}([\s\S]*?){%\s*elif\s+(\w+)\s*%}([\s\S]*?){%\s*else\s*%}([\s\S]*?){%\s*endif\s*%}/g, 
            (match, cond1, ifBlock, cond2, elifBlock, elseBlock) => {
                return context[cond1] ? ifBlock : context[cond2] ? elifBlock : elseBlock;
            }
        );

        // 📌 {% for item in list %} -> Döngü desteği
        content = content.replace(/{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g, 
            (match, itemVar, listVar, innerHTML) => {
                const list = context[listVar];
                return Array.isArray(list) ? list.map(item => innerHTML.replace(new RegExp(`{{\\s*${itemVar}\\s*}}`, 'g'), item)).join('') : '';
            }
        );

        callback(content, 'text/html');
    });
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    
    for (const { route, view } of urlpatterns) {
        if (parsedUrl.pathname.startsWith(route)) {
            return view(req, res);
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end("404 Not Found");
}


const server = http.createServer(handleRequest);

server.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});

export default renderTemplate