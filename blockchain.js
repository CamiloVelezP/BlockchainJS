// Importar la función de hash SHA256 de la biblioteca 'crypto-js'
const SHA256 = require('crypto-js/sha256');

// Definir la clase Blockchain
class Blockchain {
    constructor() {
        this.chain = []; // Array para almacenar los bloques de la cadena
        this.addBlock(this.createGenesisBlock()); // Agregar el bloque génesis al crear la cadena
    }

    // Método para crear el bloque génesis
    createGenesisBlock() {
        // Devolver un nuevo bloque con índice 0, hash anterior "0" y transacciones iniciales arbitrarias
        return new Block(0, "0", [new Transaction("Sender1", "Recipient1", 10), new Transaction("Sender2", "Recipient2", 5)]);
    }

    // Método para agregar un nuevo bloque a la cadena
    addBlock(newBlock) {
        // Establecer el hash anterior del nuevo bloque al hash del último bloque en la cadena
        newBlock.previousHash = this.getLatestBlock()?.hash || "0";
        // Minar el nuevo bloque
        newBlock.mineBlock();
        // Agregar el nuevo bloque a la cadena
        this.chain.push(newBlock);
    }

    // Método para obtener el último bloque de la cadena
    getLatestBlock() {
        if (this.chain.length > 0) {
            return this.chain[this.chain.length - 1];
        }
        return null;
    }

    // Método para verificar la validez de la cadena de bloques
    isValid() {
        // Iterar sobre todos los bloques en la cadena
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]; // Bloque actual
            const previousBlock = this.chain[i - 1]; // Bloque anterior

            // Verificar el hash del bloque actual
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false; // Si el hash no coincide, la cadena no es válida
            }

            // Verificar el hash anterior del bloque actual
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false; // Si el hash anterior no coincide, la cadena no es válida
            }

            // Verificar la raíz de Merkle del bloque actual
            if (currentBlock.merkleRoot !== currentBlock.calculateMerkleRoot()) {
                return false; // Si la raíz de Merkle no coincide, la cadena no es válida
            }
        }
        return true; // Si todos los bloques y sus conexiones son válidos, la cadena es válida
    }
}

// Definir la clase Block
class Block {
    constructor(index, previousHash, transactions) {
        this.index = index; // Índice del bloque en la cadena
        this.previousHash = previousHash; // Hash del bloque anterior
        this.transactions = transactions; // Transacciones incluidas en el bloque
        this.timestamp = Date.now(); // Marca de tiempo del bloque
        this.nonce = 0; // Número de nonce para la minería
        this.merkleRoot = this.calculateMerkleRoot(); // Raíz de Merkle de las transacciones
        this.hash = this.calculateHash(); // Hash del bloque
    }

    // Método para calcular el hash del bloque
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + this.nonce + this.merkleRoot).toString();
    }

    // Método para minar el bloque
    mineBlock() {
        // Realizar la minería hasta que se encuentre un hash válido arbitrariamente se escogio dificultad de 4 0's
        while (!this.hash.startsWith("0000")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash); // Imprimir el hash del bloque minado
    }

    // Método para calcular la raíz de Merkle de las transacciones
    calculateMerkleRoot() {
        // Obtener los hashes de las transacciones
        let hashes = this.transactions.map(transaction => transaction.calculateHash());
        // Calcular la raíz de Merkle iterativamente
        while (hashes.length > 1) {
            let newHashes = [];
            for (let i = 0; i < hashes.length; i += 2) {
                let combinedHash = (i + 1 < hashes.length) ? hashes[i] + hashes[i + 1] : hashes[i];
                newHashes.push(SHA256(combinedHash).toString());
            }
            hashes = newHashes;
        }
        return hashes[0]; // Devolver la raíz de Merkle final
    }
}

// Definir la clase Transaction
class Transaction {
    constructor(sender, recipient, amount) {
        this.sender = sender; // Remitente de la transacción
        this.recipient = recipient; // Destinatario de la transacción
        this.amount = amount; // Cantidad de la transacción
    }

    // Método para calcular el hash de la transacción
    calculateHash() {
        return SHA256(this.sender + this.recipient + this.amount).toString();
    }
}

console.log("Ejemplo de uso");
console.log("Crear un ejemplo de una blockchain con un solo bloque extra ademas del genesis");
let blockchain = new Blockchain();
blockchain.addBlock(new Block(1, "", [new Transaction("Sender3", "Recipient3", 7)]));
console.log(blockchain.chain); //mostrarla en consola
console.log("es valida?: " + blockchain.isValid()); //validando la integridad de esta blockchain
console.log("///////////////////////////////////////////////////////////////////////////////");
console.log("Crear un par de bloques con múltiples transacciones")
blockchain = new Blockchain(); // reseteo la blockchain
let transactions1 = [
    new Transaction("Sender1", "Recipient1", 10),
    new Transaction("Sender2", "Recipient2", 5)
];
let block1 = new Block(1, "", transactions1);
blockchain.addBlock(block1);
let transactions2 = [
    new Transaction("Sender3", "Recipient3", 7),
    new Transaction("Sender4", "Recipient4", 3),
    new Transaction("Sender5", "Recipient5", 2)
];
let block2 = new Block(2, "", transactions2);
blockchain.addBlock(block2);
console.log(blockchain.chain); //mostrarlo en consola
console.log("es valida?: " + blockchain.isValid()); //validando la integridad de esta blockchain
console.log("///////////////////////////////////////////////////////////////////////////////");
console.log("ahora modifiquemos una transacción, en especifico la segunda transaccion del bloque 3, tiene una cantidad de 3");
console.log(blockchain.chain[2].transactions[1]);
console.log("aumentemos esa cantidad que se envia");
blockchain.chain[2].transactions[1].amount = 100;
console.log(blockchain.chain[2].transactions[1]);
console.log("es valida?: " + blockchain.isValid());
