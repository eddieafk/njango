import http from 'http';
import url from 'url'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt';
import { User } from './db/models.js'
import { serializeUser, UserSerializer, TokenObtainSerializer, TokenRefreshSerializer } from './db/serializers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


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

// 📌 Router sistemi
const app = {
    routes: {},

    get(path, handler) {
        this.routes[`GET ${path}`] = handler;
    },

    post(path, handler) {
        this.routes[`POST ${path}`] = handler;
    },

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const handler = this.routes[`${req.method} ${parsedUrl.pathname}`];

        if (!handler) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                if (req.headers['content-type'] === 'application/json') {
                    req.body = JSON.parse(body);
                } else {
                    req.body = Object.fromEntries(new URLSearchParams(body));
                }
                handler(req, res);
            });
        } else {
            req.query = parsedUrl.query;
            handler(req, res);
        }
    }
};

// 📌 Route: Kayıt Formu Sayfası
app.get('/register', (req, res) => {
    const success = req.query.success === '1';
    renderTemplate('register.html', { success }, (content, contentType) => {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// 📌 Route: Kayıt İşlemi
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end("Fill all in the blanks");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await serializeUser.create({ username, email, password: hashedPassword });

        renderTemplate('index.html', { message: 'Kayıt başarıyla tamamlandı!' }, (content, contentType) => {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Server error");
    }
});

// Token obtain route
app.post('/api/token', async (req, res) => {
    const tokenSerializer = new TokenObtainSerializer();
    const { username, password } = req.body;

    try {
        // Find user and verify password
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }

        // Generate tokens
        const tokens = await tokenSerializer.generateTokens(user);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tokens));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
});

// Token refresh route
app.post('/api/token/refresh', async (req, res) => {
    const tokenSerializer = new TokenRefreshSerializer();
    const { refresh } = req.body;

    try {
        const tokens = await tokenSerializer.refreshToken(refresh);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tokens));
    } catch (error) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
});

export default app

// 📌 Sunucuyu başlat

