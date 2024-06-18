import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import htmlToPdf from 'html-pdf-node';// biblioteca para converter html para pdf

import dotenv from 'dotenv';
dotenv.config();

import db from './db.js';

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,POST,DELETE,OPTIONS',
}));
app.options('*', cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header({ "Access-Control-Allow-Origin": 'http://127.0.0.1:5500' });
    next();
})

app.use(bodyParser.urlencoded({
    // para todas as requisições esse metodo é chamado,
    // responsavel por transformar o corpo da requisição em um objeto...
    extended: true
}));

app.listen(3000, () =>
    console.log('Servidor iniciado na porta 3000')
);

const COLLECTION_ATIVIDADES = 'atividades';
const COLLECTION_USER = 'users';
app.get('/atividades', async (req, res, next) => {
    try {
        const docs = await db.findAll(COLLECTION_ATIVIDADES);
        res.send(docs);
    } catch (err) {
        next(err);
    }
});
app.post('/atividades', async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const nome = req.body.nome;
    try {
        const result = await db.insert(COLLECTION_ATIVIDADES, { nome });
        res.send('Salvo com sucesso');
    } catch (err) {
        next(err);
    }
});
app.delete('/atividades/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const result = await db.deleteOne(COLLECTION_ATIVIDADES, id);
        res.send('Apagado com sucesso');
    } catch (err) {
        next(err);
    }
});


app.post('/gerarPdf', async (req, res, next) => {
    const name = req.body.nome;
    const cpf = req.body.cpf;
    const tipoDeServico = req.body.tipoDeServico;
    const cidade = req.body.cidade;
    const telefone = req.body.telefone;
    const valorHoraTrabalhada = req.body.valorHoraTrabalhada;
    const qtdHorasTrabalhadas = req.body.qtdHorasTrabalhadas;
    const observacao = req.body.observacao;


    const date = new Date().toLocaleDateString()
    let file = {
        content: `
       <html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f2f2f2;
        }
        .recibo-container {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
            font-size: 24px;
        }
        p {
            margin: 10px 0;
            color: #555;
        }
        .recibo {
            line-height: 1.6;
        }
        .section-title {
            font-weight: bold;
            color: #333;
            margin-top: 20px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
        }
        .content {
            margin-top: 20px;
        }
        .field-label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            width: 200px;
        }
        .observacoes {
            margin-top: 30px;
        }
        .assinaturas {
            margin-top: 60px;
            text-align: center;
        }
        .assinaturas p {
            margin-top: 60px;
            position: relative;
        }
        .assinaturas p::before {
            content: "";
            display: block;
            width: 200px;
            height: 1px;
            background: #333;
            position: absolute;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
        }
    </style>
</head>
<body>
    <div class="recibo-container">
        <h1>RECIBO DE PAGAMENTO</h1>
        <div class="content">
            <p><span class="field-label">NOME:</span> ${name}</p>
            <p><span class="field-label">CPF:</span> ${cpf}</p>
            <p><span class="field-label">TIPO DE SERVIÇO:</span> ${tipoDeServico}</p>
            <p><span class="field-label">CIDADE DA SUA EMPRESA:</span> ${cidade}</p>
            <p><span class="field-label">TELEFONE DO PRESTADOR DE SERVIÇO:</span> ${telefone}</p>
            <p><span class="field-label">VALOR DA HORA TRABALHADA:</span> ${valorHoraTrabalhada}</p>
            <p><span class="field-label">QUANTIDADE DE HORAS TRABALHADAS:</span> ${qtdHorasTrabalhadas}</p>
            <p><span class="field-label">VALOR TOTAL R$:</span> ${qtdHorasTrabalhadas * valorHoraTrabalhada}</p>
            <p><span class="field-label">OBSERVAÇÕES:</span> ${observacao}</p>
            <p><span class="field-label">DATA DO PAGAMENTO:</span> ${date}</p>
        </div>
        <div class="section-title">Recebi a quantia acima especificada referente ao serviço prestado descrito neste recibo.</div>
        <div class="assinaturas">
            <p><span class="field-label">ASSINATURA DO PRESTADOR DE SERVIÇO:</span></p>
            <p>________________________________________________</p>
        </div>
    </div>
</body>
</html>
        `
    };
    htmlToPdf.generatePdf(file, { format: 'A4' }).then(async pdfBuffer => {
        try {
            const result = await db.insert(COLLECTION_USER, { cpf, pdf: pdfBuffer });

            res.send(result);
        } catch (err) {
            next(err);
        }

    });
});


app.get('/buscarPdf/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
        const doc = await db.findOne(COLLECTION_USER, id);
        const buffer = Buffer.from(doc.pdf.buffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=arquivo.pdf');

        res.send(buffer);
    } catch (err) {
        next(err);
    }
});
app.get('/users', async (req, res, next) => {
    try {
        const docs = await db.findAll(COLLECTION_USER);
        res.send(docs);
    } catch (err) {
        next(err);
    }
});