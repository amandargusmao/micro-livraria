const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Carrega o arquivo de dados mock
const reviews = require('./reviews.json');

// Define onde está o arquivo .proto
const PROTO_PATH = path.resolve(__dirname, '../../proto/review.proto');

// Carrega o .proto (contrato)
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const reviewProto = grpc.loadPackageDefinition(packageDefinition).review;

// Função que implementa a lógica: retorna todos os itens do arquivo mock
function searchAllReviews(_, callback) {
    callback(null, {
        reviews: reviews,
    });
}

// Inicializa o servidor gRPC
function main() {
    const server = new grpc.Server();
    // Adiciona o serviço ReviewService e a implementação da função
    server.addService(reviewProto.ReviewService.service, {
        SearchAllReviews: searchAllReviews,
    });

    // O serviço Review vai rodar na porta 3004
    server.bindAsync(
        '0.0.0.0:3004',
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if (err) {
                console.error(`Review Service failed to bind: ${err}`);
                return;
            }
            server.start();
            console.log(`Review Service running at http://127.0.0.1:${port}`);
        }
    );
}

main();