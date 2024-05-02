import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import multer from "multer";
import fs from 'fs';
import htmlToPdf from 'html-pdf-node';// biblioteca para converter html para pdf

import dotenv from 'dotenv';
dotenv.config();

import db from './db.js';

const app = express();
const diretorioUploads = 'uploads/';

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    // para todas as requisições esse metodo é chamado,
    // responsavel por transformar o corpo da requisição em um objeto...
    extended: true
}));

app.listen(3000, () =>
    console.log('Servidor iniciado na porta 3000')
);

// Configuração do multer para salvar os arquivos no disco
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, diretorioUploads); // Define o diretório onde os arquivos serão salvos
    },
    filename: function (req, file, cb) {
        // Define o nome do arquivo no disco
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Cria uma instância do middleware multer
const upload = multer({ storage: storage });

app.get("/download", (req, res) => {
    const file = path.join(path.resolve(path.dirname('')), diretorioUploads + req.body.nameFile);
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("sucesso");
        }
    });
});

app.get('/listar-arquivos', (req, res) => {
    fs.readdir(diretorioUploads, (err, arquivos) => {
        if (err) {
            res.send('Erro ao listar os arquivos:' + err);
            return;
        }

        res.send(arquivos.join('\n'));

    });
});


app.post('/enviarArquivo', upload.single("arquivo"), (req, res) => {

    return res.send("Arquivo enviado com sucesso!!")
});
//app.put('/', (req, res) => res.send('rota put'));
app.delete('/apagar', (req, res) => {
    fs.unlink(diretorioUploads + req.body.nameFile, (err) => {
        if (err) {
            res.send('Erro ao remover o arquivo:', err);
            return;
        }
        res.send('Arquivo removido com sucesso!');
    });
});

app.get('/mongo', async (req, res, next) => {
    try {
        const docs = await db.findAll();
        res.send(docs);
    } catch (err) {
        next(err);
    }
});

app.post('/mongo', async (req, res, next) => {
    const name = req.body.name;
    const age = parseInt(req.body.age);
    let file = {
        content: `
        <body>
            <h1>Nome: ${name}</h1>
            <h2>Idade: ${age}</h2>
        </body>
        `
    };
    htmlToPdf.generatePdf(file, { format: 'A4' }).then(async pdfBuffer => {
        try {
            const result = await db.insert({ name, age, pdf: pdfBuffer });
            console.log(result);
            res.send('Arquivo salvo com sucesso')
        } catch (err) {
            next(err);
        }
    });
});


app.get('/mongo/pdf/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const doc = await db.findOne(id);
        const buffer = Buffer.from(doc.pdf.buffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=arquivo.pdf');

        res.send(buffer);
    } catch (err) {
        next(err);
    }
});

app.put('/mongo/edit/:id', async (req, res, next) => {
    const id = req.params.id;
    const name = req.body.name;
    const age = parseInt(req.body.age);

    try {
        const result = await db.update(id, { name, age });
        console.log(result);
        res.send('Atualizado com sucesso');
    } catch (err) {
        next(err);
    }
});
app.delete('/mongo/delete/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const result = await db.deleteOne(id);
        console.log(result);
        res.send('apagado com sucesso')
    } catch (err) {
        next(err);
    }
})