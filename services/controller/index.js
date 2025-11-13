const packageDefinitionOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const path = require('path');
const express = require('express');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader'); 

const shipping = require('./shipping');
const inventory = require('./inventory');
const REVIEW_PROTO_PATH = path.resolve(__dirname, '../../proto/review.proto');
const reviewPackageDefinition = protoLoader.loadSync(REVIEW_PROTO_PATH, packageDefinitionOptions);
const reviewProto = grpc.loadPackageDefinition(reviewPackageDefinition).review;
const review = new reviewProto.ReviewService('host.docker.internal:3004', grpc.credentials.createInsecure());
const cors = require('cors');

const app = express();
app.use(cors());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

app.get('/product/:id', (req, res, next) => {
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(product);
        }
    });
});

app.get('/reviews', (req, res, next) => {
    // Chama método do microsserviço Review
    review.SearchAllReviews({}, (err, reviews) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Falha na comunicação com o serviço de Reviews.' });
        } else {
            res.json(reviews);
        }
    });
});

/**
 * Inicia o router
 */
async function main() {
    // Adiciona um pequeno delay para que os containers tenham tempo de subir
    await new Promise(r => setTimeout(r, 1000)); 
    app.listen(3000, () => {
        console.log('Controller Service running on http://127.0.0.1:3000');
    });
}

main();
