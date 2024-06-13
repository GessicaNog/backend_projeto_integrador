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
    const email = req.body.email;
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
            border: 1px solid #000;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        p {
            margin: 20px 0;
        }
        .recibo {
            line-height: 1.5;
        }
        .assinaturas {
            margin-top: 60px;
        }
        .assinaturas p {
            margin-top: 60px;
        }
        .observacoes {
            margin-top: 30px;
        }
    </style>
       
        </head>
        <body>
            <h1> RECIBO  DE PAGAMENTO</h1>
            <p> <b> NOME:</b> ${name} </P>
            <P> <b> CPF :</b> ${cpf} </P>
            <P> <b> TIPO DE SERVIÇO : </b> ${tipoDeServico} </P>
            <P> <b> CIDADE DA SUA EMPRESA : </b> ${cidade} </p>   
            <P> <b> TELEFONE DO PRESTADOR DE SERVIÇO: </b> ${telefone} </p>  
            <P> <b> EMAIL DO PRESTADOR DE SERVIÇO: </b> ${email} </p>  
            <P> <b> VALOR DA HORA TRABALHADA : </b> ${valorHoraTrabalhada} </p> 
            <P> <b> QUANTIDADES DE HORAS TRABALHADAS : </b> ${qtdHorasTrabalhadas} </p> 
            <P> <b> VALOR TOTAL R$ : </b> ${qtdHorasTrabalhadas * valorHoraTrabalhada} </p> 
             <P> <b> OBSERVAÇÕES : </b> ${observacao} </p>

             <P> <b> DATA DO PAGAMENTO: </b> ${date}

             <P> <b> Recebi a quantia acima especificada referente ao serviço prestado descrito neste recibo.</b> </P>


             <P> <b> ASSINATURA DO PRESTADOR DE SERVIÇO: <br><br>________________________________________________ </b> </p>



        
        
        </body>
        </html>
        `
    };
    htmlToPdf.generatePdf(file, { format: 'A4' }).then(async pdfBuffer => {
         try {
             const result = await db.insert(COLLECTION_USER, { cpf, pdf: pdfBuffer });
             console.log(result);
             res.send('Arquivo salvo com sucesso')
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